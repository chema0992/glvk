
(() => {
    const STORAGE_KEY = "glvk-font-settings-v1";

    const PRESETS = {
        paperlogy: '"Paperozi", sans-serif',
        system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    };

    let activeStylesheet = null;
    let activeFontFace = null;

    const root = document.documentElement;

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
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error("[GLVK Font] Failed to save settings:", error);
        }
    }

    // 기존 Custom 폰트 제거
    function clearCustomFont() {
        if (activeStylesheet) {
            activeStylesheet.remove();
            activeStylesheet = null;
        }

        if (activeFontFace) {
            document.fonts.delete(activeFontFace);
            activeFontFace = null;
        }
    }

    // 폰트 이름을 CSS 문자열로 변환
    function makeFontStack(name) {
        const escaped = name
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/[\r\n\f]/g, " ");

        return `"${escaped}", sans-serif`;
    }

    // URL 검증
    function validateURL(value) {
        const url = new URL(value);

        if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("HTTP 또는 HTTPS URL만 사용할 수 있어.");
        }

        if (
            location.protocol === "https:" &&
            url.protocol !== "https:"
        ) {
            throw new Error("HTTPS URL을 사용해야 해.");
        }

        return url.href;
    }

    // 기본 폰트 적용
    function applyPreset(name, save = true) {
        clearCustomFont();

        if (!PRESETS[name]) {
            name = "paperlogy";
        }

        root.style.setProperty(
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
    async function applyCustom(settings, save = true) {
        const family = settings.family.trim();
        const url = validateURL(settings.url);

        if (!family) {
            throw new Error("Font Family를 입력해 줘.");
        }

        clearCustomFont();

        if (settings.source === "css") {
            // 외부 CSS 파일 불러오기
            const link = document.createElement("link");

            link.rel = "stylesheet";
            link.href = url;

            activeStylesheet = link;

            await new Promise((resolve, reject) => {
                link.onload = resolve;
                link.onerror = () => reject(
                    new Error("폰트 CSS를 불러오지 못했어.")
                );

                document.head.appendChild(link);
            });

        } else if (settings.source === "file") {
            // WOFF / WOFF2 파일 직접 불러오기
            if (!("FontFace" in window)) {
                throw new Error("이 브라우저는 FontFace를 지원하지 않아.");
            }

            const face = new FontFace(
                family,
                `url(${JSON.stringify(url)})`,
                { weight: "400" }
            );

            await face.load();

            document.fonts.add(face);
            activeFontFace = face;

        } else {
            throw new Error("잘못된 폰트 소스야.");
        }

        root.style.setProperty(
            "--glvk-font-family",
            makeFontStack(family)
        );

        if (save) {
            saveSettings({
                type: "custom",
                family,
                url,
                source: settings.source
            });
        }
    }

    // UI 생성
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
                        기본 글꼴
                    </label>

                    <select id="glvk-font-mode">
                        <option value="paperlogy">
                            Paperlogy
                        </option>

                        <option value="system">
                            System Default
                        </option>

                        <option value="custom">
                            Custom
                        </option>
                    </select>

                    <div id="glvk-custom-fields" hidden>
                        <label for="glvk-font-family">
                            Font Family
                        </label>

                        <input
                            id="glvk-font-family"
                            type="text"
                            placeholder="예: Pretendard"
                            maxlength="100"
                        >

                        <label for="glvk-font-source">
                            불러오기 방식
                        </label>

                        <select id="glvk-font-source">
                            <option value="css">
                                CSS URL
                            </option>

                            <option value="file">
                                Font File URL
                            </option>
                        </select>

                        <label for="glvk-font-url">
                            Font URL
                        </label>

                        <input
                            id="glvk-font-url"
                            type="url"
                            placeholder="https://example.com/font.css"
                        >

                        <small>
                            CSS URL: 외부 CSS 스타일시트 주소
                            <br>
                            Font File URL: WOFF 또는 WOFF2 주소
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
        const family = container.querySelector("#glvk-font-family");
        const source = container.querySelector("#glvk-font-source");
        const url = container.querySelector("#glvk-font-url");

        const status = container.querySelector("#glvk-font-status");

        // 패널 열기 / 닫기
        function setPanel(open) {
            panel.hidden = !open;
            toggle.setAttribute("aria-expanded", String(open));
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

        // 폰트 종류 선택
        mode.addEventListener("change", () => {
            const selected = mode.value;

            fields.hidden = selected !== "custom";

            if (selected !== "custom") {
                applyPreset(selected);

                status.textContent = "폰트가 변경되었어.";
            } else {
                status.textContent = "Custom 폰트 정보를 입력해 줘.";
            }
        });

        // Custom 폰트 적용
        form.addEventListener("submit", async event => {
            event.preventDefault();

            status.textContent = "폰트를 불러오는 중...";

            try {
                await applyCustom({
                    family: family.value,
                    source: source.value,
                    url: url.value
                });

                status.textContent = "폰트가 적용되었어!";

            } catch (error) {
                console.error("[GLVK Font]", error);

                applyPreset("paperlogy");

                mode.value = "paperlogy";
                fields.hidden = true;

                status.textContent =
                    `폰트 적용 실패: ${error.message} 기본 폰트로 복구했어.`;
            }
        });

        // 이전 설정 복구
        return {
            mode,
            fields,
            family,
            source,
            url,
            status
        };
    }

    // 초기화
    async function init() {
        const ui = createUI();
        const saved = loadSettings();

        if (saved?.type === "custom") {
            ui.mode.value = "custom";
            ui.fields.hidden = false;

            ui.family.value = saved.family || "";
            ui.source.value = saved.source || "css";
            ui.url.value = saved.url || "";

            try {
                await applyCustom(saved, false);

                ui.status.textContent = "저장된 Custom 폰트를 적용했어.";

            } catch (error) {
                applyPreset("paperlogy");

                ui.mode.value = "paperlogy";
                ui.fields.hidden = true;

                ui.status.textContent =
                    "저장된 폰트를 불러오지 못했어. 기본 폰트를 사용해.";
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

    init();
})();
