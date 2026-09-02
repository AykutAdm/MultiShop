/* ==========================================================================
   login-form  -  Koyu tema giris / kayit formu (JavaScript)
   --------------------------------------------------------------------------
   Bagimsizdir, hicbir kutuphane gerektirmez (jQuery yok).
   Iki isi yapar:
     1) <canvas class="lf-particles"> icine yukselen partikul animasyonu cizer
     2) [data-lf-toggle="inputId"] butonlariyla sifre goster/gizle saglar

   Sayfanin sonunda su sekilde cagirin:
       <script src="login-form/js/login-form.js"></script>

   Dinamik olarak eklenen bir formdan sonra yeniden baglamak isterseniz:
       LoginForm.init();
   ========================================================================== */

(function (window, document) {
    "use strict";

    var prefersReducedMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ----------------------------------------------------------------------
       Yukselen partikuller
       ---------------------------------------------------------------------- */
    function initParticles(canvas) {
        if (!canvas || !canvas.getContext || canvas.dataset.lfReady === "1") return;
        canvas.dataset.lfReady = "1";

        var ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Hareket azaltma tercihi acikken animasyonu hic baslatma
        if (prefersReducedMotion) return;

        var particles = [];
        var raf = 0;

        function setSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function make() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                v: Math.random() * 0.25 + 0.05,   // yukselme hizi
                o: Math.random() * 0.35 + 0.15    // saydamlik
            };
        }

        function seed() {
            particles = [];
            var count = Math.floor((canvas.width * canvas.height) / 9000);
            for (var i = 0; i < count; i++) particles.push(make());
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.y -= p.v;

                // Ust kenari gecen partikulu asagidan yeniden dogur
                if (p.y < 0) {
                    p.x = Math.random() * canvas.width;
                    p.y = canvas.height + Math.random() * 40;
                    p.v = Math.random() * 0.25 + 0.05;
                    p.o = Math.random() * 0.35 + 0.15;
                }

                ctx.fillStyle = "rgba(250,250,250," + p.o + ")";
                ctx.fillRect(p.x, p.y, 0.7, 2.2);
            }

            raf = window.requestAnimationFrame(draw);
        }

        function onResize() {
            setSize();
            seed();
        }

        setSize();
        seed();
        window.addEventListener("resize", onResize);
        raf = window.requestAnimationFrame(draw);

        // Sekme arka plana alindiginda animasyonu durdur
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                window.cancelAnimationFrame(raf);
            } else {
                raf = window.requestAnimationFrame(draw);
            }
        });
    }

    /* ----------------------------------------------------------------------
       Sifre goster / gizle
       ---------------------------------------------------------------------- */
    function initToggle(btn) {
        if (!btn || btn.dataset.lfReady === "1") return;
        btn.dataset.lfReady = "1";

        btn.addEventListener("click", function () {
            var input = document.getElementById(btn.getAttribute("data-lf-toggle"));
            if (!input) return;

            var willShow = input.type === "password";
            input.type = willShow ? "text" : "password";

            btn.classList.toggle("is-visible", willShow);
            btn.setAttribute("aria-pressed", willShow ? "true" : "false");
            btn.setAttribute(
                "aria-label",
                willShow
                    ? btn.getAttribute("data-lf-label-hide") || "Sifreyi gizle"
                    : btn.getAttribute("data-lf-label-show") || "Sifreyi goster"
            );

            input.focus();
        });
    }

    /* ----------------------------------------------------------------------
       Baslatici
       ---------------------------------------------------------------------- */
    function init() {
        var canvases = document.querySelectorAll(".lf-particles");
        for (var i = 0; i < canvases.length; i++) initParticles(canvases[i]);

        var toggles = document.querySelectorAll("[data-lf-toggle]");
        for (var j = 0; j < toggles.length; j++) initToggle(toggles[j]);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    window.LoginForm = { init: init };
})(window, document);
