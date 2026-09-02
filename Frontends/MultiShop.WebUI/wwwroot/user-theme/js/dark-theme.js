
(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var body = document.body;
        var sidebar = document.getElementById("sidebar");
        if (!body.classList.contains("nova-dark")) { return; }

       
        var offcanvasBtn = document.querySelector('[data-toggle="offcanvas"]');
        var minimizeBtn = document.querySelector('[data-toggle="minimize"]');
        var backdrop = document.querySelector(".sidebar-backdrop");

        function toggleMobileSidebar() {
            body.classList.toggle("sidebar-open");
        }

        if (offcanvasBtn) {
            offcanvasBtn.addEventListener("click", toggleMobileSidebar);
        }

        if (minimizeBtn) {
            minimizeBtn.addEventListener("click", function () {
                if (window.innerWidth < 992) {
                    toggleMobileSidebar();
                } else {
                    body.classList.toggle("sidebar-icon-only");
                }
            });
        }

        if (backdrop) {
            backdrop.addEventListener("click", function () {
                body.classList.remove("sidebar-open");
            });
        }

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") { body.classList.remove("sidebar-open"); }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth >= 992) { body.classList.remove("sidebar-open"); }
        });


        if (sidebar) {
            var current = window.location.pathname.replace(/\/+$/, "").toLowerCase();
            var links = sidebar.querySelectorAll(".nav-link");
            var matched = null;
            var fallback = null;

            // /Alan/Controller kismi - Create/Update sayfalarinda da menuyu isaretler
            function areaController(path) {
                var parts = path.split("/").filter(Boolean);
                return parts.length >= 2 ? "/" + parts[0] + "/" + parts[1] : "";
            }

            var currentGroup = areaController(current);

            for (var i = 0; i < links.length; i++) {
                var raw = links[i].getAttribute("href") || "";
                if (!raw || raw === "#" || raw.indexOf("http") === 0) { continue; }

                var href = raw.replace(/\/+$/, "").toLowerCase();
                if (current === href) { matched = links[i]; break; }

                if (!fallback && currentGroup && areaController(href) === currentGroup) {
                    fallback = links[i];
                }
            }

            if (!matched) { matched = fallback; }
            if (matched) { matched.classList.add("active"); }
        }
    });
})();
