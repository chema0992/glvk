(() => {
    "use strict";

    const STORAGE_KEY = "glvk-font-settings-v2";
    const MAX_CSS_LENGTH = 30000;

    const ROOT = document.documentElement;

    const PRESETS = {
        paperlogy: '"Paperozi", sans-serif',
        system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    };

    let activeStyle = null;

    // 설정 불러오기
    function loadSettings() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY));
        } catch {
            return null;
        }
    }

    // 설정 저장
    function saveSettings(settings) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(settings)
            );

            return true;
        } catch (error) {
            console.error("[GLVK Font] Save failed:", error);
            return false;
        }
    }

    // Custom CSS 제거
    function clearCustomFont() {
        if (activeStyle) {
            activeStyle.remove();
            activeStyle = null;
        }
    }

    // CSS 문자열에서 바깥쪽 따옴표 제거
    function unquote(value) {
        value = value.trim();

        if (
            (value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))
        ) {
            return value.slice(1, -1);
        }

        return value;
    }

    // Custom CSS 검증 및 등록
    function installFontCSS(css) {
        if (!css.trim()) {
            throw new Error("CSS를 입력해 줘.");
        }

        if (css.length > MAX_CSS_LENGTH) {
            throw new Error("CSS가 너무 길어. 30KB 이하로 입력해 줘.");
        }

        const style = document.createElement("style");

        style.id = "glvk-custom-font";
        style.textContent = css;

        document.head.appendChild(style);

        try {
            const rules = Array.from(
                style.sheet?.cssRules || []
            );

            if (rules.length === 0) {
                throw new Error("유효한 @font-face를 찾을 수 없어.");
            }

            // @font-face 이외의 CSS 규칙 차단
            const fontFaceType = window.CSSRule?.FONT_FACE_RULE ?? 5;

            if (rules.some(rule => rule.type !== fontFaceType)) {
                throw new Error(
                    "@font-face 규칙만 입력할 수 있어."
                );
            }

            const faces = rules;

            // 모든 @font-face가 동일한 Font Family를 사용하는지 확인
            const families = faces.map(rule =>
                rule.style.getPropertyValue("font-family").trim()
            );

            if (families.some(family => !family)) {
                throw new Error("font-family가 지정되지 않은 규칙이 있어.");
            }

            const normalizedFamilies = new Set(
                families.map(family =>
                    unquote(family).toLowerCase()
                )
            );

            if (normalizedFamilies.size !== 1) {
                throw new Error(
                    "모든 @font-face의 font-family를 동일하게 지정해 줘."
                );
            }

            // src 및 URL 검사
            for (const face of faces) {
                const src = face.style.getPropertyValue("src").trim();

                if (!src) {
                    throw new Error(
                        "src가 지정되지 않은 @font-face가 있어."
                    );
                }

                const matches = [
                    ...src.matchAll(
                        /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi
                    )
                ];

                if (matches.length === 0) {
                    throw new Error(
                        "src에 url(...) 주소가 필요해."
                    );
                }

                for (const match of matches) {
                    const value = (
                        match[1] ??
                        match[2] ??
                        match[3] ??
                        ""
                    ).trim();

                    const url = new URL(value, document.baseURI);

                    if (!["http:", "https:"].includes(url.protocol)) {
                        throw new Error(
                            "폰트 URL은 HTTP 또는 HTTPS만 사용할 수 있어."
                        );
                    }
                }
            }

            return {
                style,
                faces,
                family: families[0]
            };

        } catch (error) {
            style.remove();
            throw error;
        }
    }

    // 기본 폰트 적용
    function applyPreset(name, save = true) {
        clearCustomFont();

        if (!PRESETS[name]) {
            name = "paperlogy";
        }

        ROOT.style.setProperty(
            "--glvk-font-family",
            PRESETS[name]
        );

        if (save) {
            saveSettings({
                type: "preset",
                preset: name
            });
        }
    }

    // Custom 폰트 적용
    async function applyCustom(css, save = true) {
        clearCustomFont();

        const result = installFontCSS(css);

        activeStyle = result.style;

        // CSS에서 Font Family 자동 추출
        ROOT.style.setProperty(
            "--glvk-font-family",
            `${result.family}, sans-serif`
        );

        try {
            // 각 @font-face의 굵기와 스타일에 맞춰 로딩 시도
            for (const face of result.faces) {
                const weightValue = face.style
                    .getPropertyValue("font-weight")
                    .trim()
                    .toLowerCase();

                const weightMatch = weightValue.match(
                    /\b(100|200|300|400|500|600|700|800|900)\b/
                );

                const weight = weightMatch
                    ? weightMatch[0]
                    : weightValue === "bold"
                        ? "700"
                        : "400";

                const styleValue = face.style
                    .getPropertyValue("font-style")
                    .trim()
                    .toLowerCase();

                const fontStyle = styleValue.startsWith("italic")
                    ? "italic"
                    : styleValue.startsWith("oblique")
                        ? "oblique"
                        : "normal";

                const query = `${fontStyle} ${weight} 16px ${result.family}`;

                await document.fonts.load(query);
            }

        } catch (error) {
            clearCustomFont();
            throw new Error(
                "폰트를 불러오지 못했어. URL과 CORS 설정을 확인해 줘."
            );
        }

        if (save) {
            saveSettings({
                type: "custom",
                css
            });
        }

        return unquote(result.family);
    }

    // 설정 UI 생성
    function createUI() {
        const container = document.createElement("div");

        container.innerHTML = `
            <button
                id="glvk-font-toggle"
                type="button"
                aria-label="폰트 설정"
                aria-expanded="false"
            >Aa</button>

            <section
                id="glvk-font-panel"
                role="dialog"
                aria-label="폰트 설정"
                hidden
            >
                <div class="glvk-font-header">
                    <strong>폰트 설정</strong>

                    <button
                        class="glvk-font-close"
                        type="button"
                        aria-label="닫기"
                    >×</button>
                </div>

                <form id="glvk-font-form">
                    <label for="glvk-font-mode">
                        글꼴 종류
                    </label>

                    <select id="glvk-font-mode">
                        <option value="paperlogy">
                            Paperlogy
                        </option>

                        <option value="system">
                            System Default
                        </option>

                        <option value="custom">
                            Custom CSS
                        </option>
                    </select>

                    <div id="glvk-custom-fields" hidden>
                        <label for="glvk-font-css">
                            Font CSS
                        </label>

                        <textarea
                            id="glvk-font-css"
                            spellcheck="false"
                            placeholder="@font-face {
    font-family: 'MyFont';
    src: url('https://example.com/font.woff2') format('woff2');
    font-weight: 400;
    font-display: swap;
    font-style: normal;
}"
                        ></textarea>

                        <small>
                            @font-face 규칙만 입력할 수 있어.
                            여러 굵기를 등록하려면 여러 규칙을 작성하면 돼.
                        </small>

                        <button
                            class="glvk-font-apply"
                            type="submit"
                        >
                            적용하기
                        </button>
                    </div>

                    <p
                        id="glvk-font-status"
                        role="status"
                        aria-live="polite"
                    ></p>
                </form>
            </section>
        `;

        document.body.appendChild(container);

        const toggle = container.querySelector("#glvk-font-toggle");
        const panel = container.querySelector("#glvk-font-panel");
        const close = container.querySelector(".glvk-font-close");

        const form = container.querySelector("#glvk-font-form");
        const mode = container.querySelector("#glvk-font-mode");

        const fields = container.querySelector("#glvk-custom-fields");
        const cssInput = container.querySelector("#glvk-font-css");
        const status = container.querySelector("#glvk-font-status");

        // 패널 열기 / 닫기
        function setPanel(open) {
            panel.hidden = !open;

            toggle.setAttribute(
                "aria-expanded",
                String(open)
            );
        }

        toggle.addEventListener("click", () => {
            setPanel(panel.hidden);
        });

        close.addEventListener("click", () => {
            setPanel(false);
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                setPanel(false);
            }
        });

        // 글꼴 선택
        mode.addEventListener("change", () => {
            const selected = mode.value;

            fields.hidden = selected !== "custom";

            if (selected !== "custom") {
                applyPreset(selected);

                status.textContent = "폰트가 변경되었어.";
            } else {
                status.textContent =
                    "Custom CSS를 입력하고 적용해 줘.";
            }
        });

        // Custom CSS 적용
        form.addEventListener("submit", async event => {
            event.preventDefault();

            if (mode.value !== "custom") return;

            status.textContent = "폰트를 불러오는 중...";

            try {
                const family = await applyCustom(cssInput.value);

                status.textContent =
                    `적용 완료: ${family}`;

            } catch (error) {
                console.error("[GLVK Font]", error);

                applyPreset("paperlogy");

                mode.value = "paperlogy";
                fields.hidden = true;

                status.textContent =
                    `적용 실패: ${error.message} Paperlogy로 복구했어.`;
            }
        });

        return {
            mode,
            fields,
            cssInput,
            status
        };
    }

    // 초기화
    async function init() {
        const ui = createUI();
        const saved = loadSettings();

        if (saved?.type === "custom" && typeof saved.css === "string") {
            ui.mode.value = "custom";
            ui.fields.hidden = false;
            ui.cssInput.value = saved.css;

            ui.status.textContent = "저장된 폰트를 불러오는 중...";

            try {
                const family = await applyCustom(saved.css, false);

                ui.status.textContent =
                    `저장된 폰트 적용 완료: ${family}`;

            } catch (error) {
                console.error("[GLVK Font]", error);

                applyPreset("paperlogy");

                ui.mode.value = "paperlogy";
                ui.fields.hidden = true;

                ui.status.textContent =
                    "저장된 폰트를 불러오지 못했어. Paperlogy로 복구했어.";
            }

        } else {
            const preset = saved?.preset === "system"
                ? "system"
                : "paperlogy";

            applyPreset(preset);

            ui.mode.value = preset;
            ui.fields.hidden = true;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, {
            once: true
        });
    } else {
        init();
    }
})();