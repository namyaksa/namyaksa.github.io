/* ======================================
   파란약국 홈페이지
   app.js
====================================== */

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // 현재 메뉴 강조
    // ===============================
    const current = location.pathname.split("/").pop();

    document.querySelectorAll(".menu a").forEach(link => {
        const href = link.getAttribute("href");

        if (href === current || (current === "" && href === "index.html")) {
            link.style.color = "#0d9488";
            link.style.fontWeight = "700";
        }
    });

    // ===============================
    // 카드 애니메이션
    // ===============================
    const cards = document.querySelectorAll(".card");

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }

        });

    });

    cards.forEach(card => {

        card.style.opacity = "0";
        card.style.transform = "translateY(40px)";
        card.style.transition = "0.6s";

        observer.observe(card);

    });

    // ===============================
    // 맨 위 버튼 생성
    // ===============================
    const topBtn = document.createElement("button");

    topBtn.innerHTML = "▲";

    topBtn.id = "topBtn";

    document.body.appendChild(topBtn);

    Object.assign(topBtn.style, {
        position: "fixed",
        right: "25px",
        bottom: "25px",
        width: "50px",
        height: "50px",
        border: "none",
        borderRadius: "50%",
        background: "#0d9488",
        color: "white",
        fontSize: "18px",
        cursor: "pointer",
        display: "none",
        boxShadow: "0 5px 15px rgba(0,0,0,.2)"
    });

    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {

            topBtn.style.display = "block";

        } else {

            topBtn.style.display = "none";

        }

    });

    topBtn.onclick = () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };

    // ===============================
    // 다크모드
    // ===============================
    const darkBtn = document.createElement("button");

    darkBtn.innerHTML = "🌙";

    darkBtn.id = "darkBtn";

    document.body.appendChild(darkBtn);

    Object.assign(darkBtn.style, {
        position: "fixed",
        right: "25px",
        bottom: "90px",
        width: "50px",
        height: "50px",
        border: "none",
        borderRadius: "50%",
        background: "#222",
        color: "white",
        cursor: "pointer",
        fontSize: "18px"
    });

    if (localStorage.getItem("theme") === "dark") {

        document.body.classList.add("dark");

    }

    darkBtn.onclick = () => {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {

            localStorage.setItem("theme", "dark");

        } else {

            localStorage.setItem("theme", "light");

        }

    };

});

// ======================================
// 검색 함수 (추후 study 페이지에서 사용)
// ======================================

function searchPosts(keyword) {

    keyword = keyword.toLowerCase();

    console.log("검색:", keyword);

}