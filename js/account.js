/* =========================================================
   ACCOUNT.JS
   LOGIN / REGISTER / ACCOUNT
========================================================= */


/* =========================================================
   USER DATA
========================================================= */

function getUsers() {

    try {

        return JSON.parse(
            localStorage.getItem("users")
        ) || [];

    } catch (error) {

        return [];
    }
}


function saveUsers(users) {

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );
}


function getCurrentUser() {

    try {

        return JSON.parse(
            localStorage.getItem("currentUser")
        );

    } catch (error) {

        return null;
    }
}


/* =========================================================
   LOGIN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginForm =
            document.getElementById("loginForm");

        if (!loginForm) return;


        const phone =
            document.getElementById("phone");

        const password =
            document.getElementById("password");

        const phoneError =
            document.getElementById("phoneError");

        const passwordError =
            document.getElementById("passwordError");

        const showPassword =
            document.getElementById("showPassword");


        /* CLEAR ERROR */

        phone.addEventListener(
            "input",
            function () {

                phoneError.textContent = "";

                phone.classList.remove(
                    "error"
                );
            }
        );


        password.addEventListener(
            "input",
            function () {

                passwordError.textContent = "";

                password.classList.remove(
                    "error"
                );
            }
        );


        /* SUBMIT */

        loginForm.addEventListener(
            "submit",
            function (e) {

                e.preventDefault();

                let valid = true;


                const phoneValue =
                    phone.value.trim();

                const passwordValue =
                    password.value;


                /* PHONE */

                if (phoneValue === "") {

                    phoneError.textContent =
                        "Vui lòng nhập số điện thoại";

                    phone.classList.add(
                        "error"
                    );

                    valid = false;

                } else if (
                    !/^0\d{9}$/.test(
                        phoneValue
                    )
                ) {

                    phoneError.textContent =
                        "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0";

                    phone.classList.add(
                        "error"
                    );

                    valid = false;
                }


                /* PASSWORD */

                if (passwordValue === "") {

                    passwordError.textContent =
                        "Vui lòng nhập mật khẩu";

                    password.classList.add(
                        "error"
                    );

                    valid = false;
                }


                if (!valid) return;


                /* FIND USER */

                const users = getUsers();

                const user =
                    users.find(
                        function (item) {

                            return (
                                item.phone ===
                                    phoneValue &&
                                item.password ===
                                    passwordValue
                            );
                        }
                    );


                if (!user) {

                    passwordError.textContent =
                        "Số điện thoại hoặc mật khẩu không đúng";

                    password.classList.add(
                        "error"
                    );

                    return;
                }


                /* SAVE CURRENT USER */
                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(user)
                );


                /* LOGIN THÀNH CÔNG */

                alert(
                    "Đăng nhập thành công!"
                );


                /* VỀ TRANG CHỦ */

                window.location.href =
                    "index.html";
            }
        );
    }
);



/* =========================================================
   THEME TOGGLE - chỉ dùng cho các trang account/register/profile/forgot
   Không phụ thuộc vào common.js, home.js hay các file bị khóa.
========================================================= */
(function setupAccountTheme() {
    function applyTheme(theme) {
        document.body.classList.toggle("theme-dark", theme === "dark");
        localStorage.setItem("greenphone-theme", theme);
        const button = document.getElementById("accountThemeToggle");
        if (button) {
            const dark = theme === "dark";
            button.innerHTML = dark
                ? '<svg class="gp-theme-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
                : '<svg class="gp-theme-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.6 8.6 0 1 0 20.2 15.2Z"/></svg>';
            button.setAttribute("aria-label", dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
            button.title = dark ? "Light mode" : "Dark mode";
        }
    }

    function initTheme() {
        if (!document.body) return;

        const page = location.pathname.split("/").pop().toLowerCase();
        const supported = ["login.html", "register.html", "account.html", "forgot-password.html", "register-modal.html"];
        if (!supported.includes(page)) return;

        if (page === "register-modal.html") {
            document.body.classList.add("is-register-iframe");
        }

        const pagesWithoutThemeToggle = ["login.html", "register.html", "forgot-password.html"];
        if (!pagesWithoutThemeToggle.includes(page) &&
            !document.getElementById("accountThemeToggle") &&
            page !== "register-modal.html") {
            const createdButton = document.createElement("button");
            createdButton.type = "button";
            createdButton.id = "accountThemeToggle";
            createdButton.className = "account-theme-toggle";
            createdButton.setAttribute("aria-label", "Chuyển giao diện");
            createdButton.title = "Chuyển giao diện sáng/tối";
            document.body.appendChild(createdButton);
        }

        // Gắn sự kiện cho cả nút có sẵn trong account.html và nút được tạo động.
        // Trước đây chỉ nút tạo động có listener, khiến nút trong header Profile không bấm được.
        const themeButton = document.getElementById("accountThemeToggle");
        if (themeButton && themeButton.dataset.themeListenerAttached !== "true") {
            themeButton.addEventListener("click", function (event) {
                event.preventDefault();
                applyTheme(document.body.classList.contains("theme-dark") ? "light" : "dark");
            });
            themeButton.dataset.themeListenerAttached = "true";
        }

        const saved = localStorage.getItem("greenphone-theme");
        const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(saved || (systemDark ? "dark" : "light"));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initTheme, { once: true });
    } else {
        initTheme();
    }
})();

/* =========================================================
   REGISTER
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const registerForm =
            document.getElementById(
                "registerForm"
            );

        if (!registerForm) return;


        const fullname =
            document.getElementById(
                "fullname"
            );

        const birthday =
            document.getElementById(
                "birthday"
            );

        const phone =
            document.getElementById(
                "phone"
            );

        const email =
            document.getElementById(
                "email"
            );

        const password =
            document.getElementById(
                "password"
            );

        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            );


        const fullnameError =
            document.getElementById(
                "fullnameError"
            );

        const phoneError =
            document.getElementById(
                "phoneError"
            );

        const emailError =
            document.getElementById(
                "emailError"
            );

        const passwordError =
            document.getElementById(
                "passwordError"
            );

        const confirmPasswordError =
            document.getElementById(
                "confirmPasswordError"
            );


        /* SWITCH */

        const studentSwitch =
            document.getElementById(
                "studentSwitch"
            );

        const studentForm =
            document.getElementById(
                "studentForm"
            );

        const businessSwitch =
            document.getElementById(
                "businessSwitch"
            );

        const businessForm =
            document.getElementById(
                "businessForm"
            );


        /* STUDENT FORM */

        function updateStudent() {

            if (!studentSwitch ||
                !studentForm) return;


            studentForm.classList.toggle(
                "active",
                studentSwitch.checked
            );


            const fields = [

                document.getElementById(
                    "educationLevel"
                ),

                document.getElementById(
                    "schoolName"
                ),

                document.getElementById(
                    "studentId"
                ),

                document.getElementById(
                    "cardName"
                ),

                document.getElementById(
                    "studentExpiry"
                )
            ];


            fields.forEach(
                function (field) {

                    if (field) {

                        field.required =
                            studentSwitch.checked;
                    }
                }
            );
        }


        /* BUSINESS */

        function updateBusiness() {

            if (!businessSwitch ||
                !businessForm) return;


            businessForm.classList.toggle(
                "active",
                businessSwitch.checked
            );


            const fields =
                businessForm.querySelectorAll(
                    "input"
                );


            fields.forEach(
                function (field, index) {

                    if (
                        index === 5
                    ) {

                        field.required =
                            false;

                    } else {

                        field.required =
                            businessSwitch.checked;
                    }
                }
            );
        }


        if (studentSwitch) {

            studentSwitch.addEventListener(
                "change",
                function () {

                    if (
                        studentSwitch.checked &&
                        businessSwitch
                    ) {

                        businessSwitch.checked =
                            false;
                    }

                    updateStudent();
                    updateBusiness();
                }
            );
        }


        if (businessSwitch) {

            businessSwitch.addEventListener(
                "change",
                function () {

                    if (
                        businessSwitch.checked &&
                        studentSwitch
                    ) {

                        studentSwitch.checked =
                            false;
                    }

                    updateStudent();
                    updateBusiness();
                }
            );
        }


        updateStudent();
        updateBusiness();



        /* =====================================================
           FILE UPLOAD - SINH VIÊN / GIÁO VIÊN + DOANH NGHIỆP
           Click vào "Chọn file" hoặc toàn bộ khung để mở hộp chọn file.
        ===================================================== */

        function setupFileUploads() {
            document.querySelectorAll(".upload-area").forEach(function (area) {
                const input = area.querySelector('input[type="file"]');
                if (!input) return;

                const textSpan = area.querySelector("span");
                const originalText = textSpan ? textSpan.textContent : "Chọn file";

                function showSelectedFile() {
                    const file = input.files && input.files[0];

                    if (!file) {
                        if (textSpan) textSpan.textContent = originalText;
                        return;
                    }

                    const isBusinessFile =
                        input.id === "businessLicense" ||
                        input.id === "authorizationPaper";

                    const maxSize = isBusinessFile
                        ? 5 * 1024 * 1024
                        : 10 * 1024 * 1024;

                    if (file.size > maxSize) {
                        alert(
                            "File \"" + file.name + "\" vượt quá giới hạn " +
                            (isBusinessFile ? "5 MB." : "10 MB.")
                        );
                        input.value = "";
                        if (textSpan) textSpan.textContent = originalText;
                        return;
                    }

                    if (textSpan) {
                        textSpan.textContent = file.name;
                    }

                    area.classList.add("has-file");
                }

                area.addEventListener("click", function (event) {
                    if (
                        event.target === input ||
                        event.target.closest("button")
                    ) {
                        return;
                    }

                    input.click();
                });

                input.addEventListener("change", showSelectedFile);

                area.addEventListener("dragover", function (event) {
                    event.preventDefault();
                    area.classList.add("dragging");
                });

                area.addEventListener("dragleave", function () {
                    area.classList.remove("dragging");
                });

                area.addEventListener("drop", function (event) {
                    event.preventDefault();
                    area.classList.remove("dragging");

                    const files = event.dataTransfer.files;
                    if (!files || !files.length) return;

                    try {
                        input.files = files;
                        input.dispatchEvent(new Event("change", { bubbles: true }));
                    } catch (error) {
                        /* Một số trình duyệt không cho gán FileList trực tiếp. */
                        alert("Vui lòng bấm Chọn file để tải tài liệu.");
                    }
                });
            });
        }

        setupFileUploads();

        /* SUBMIT REGISTER */

        registerForm.addEventListener(
            "submit",
            function (e) {

                e.preventDefault();


                fullnameError.textContent = "";
                phoneError.textContent = "";
                emailError.textContent = "";
                passwordError.textContent = "";
                confirmPasswordError.textContent = "";


                let valid = true;


                const fullnameValue =
                    fullname.value.trim();

                const phoneValue =
                    phone.value.trim();

                const emailValue =
                    email.value.trim();

                const passwordValue =
                    password.value;

                const confirmPasswordValue =
                    confirmPassword.value;


                /* NAME */

                if (!fullnameValue) {

                    fullnameError.textContent =
                        "Vui lòng nhập họ và tên";

                    valid = false;
                }


                /* PHONE */

                if (!/^0\d{9}$/.test(
                    phoneValue
                )) {

                    phoneError.textContent =
                        "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0";

                    valid = false;
                }


                /* EMAIL - không bắt buộc */

                if (
                    emailValue &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        .test(emailValue)
                ) {

                    emailError.textContent =
                        "Email không hợp lệ";

                    valid = false;
                }


                /* PASSWORD */

                if (
                    passwordValue.length < 6
                ) {

                    passwordError.textContent =
                        "Mật khẩu phải có ít nhất 6 ký tự";

                    valid = false;
                }


                /* CONFIRM */

                if (
                    passwordValue !==
                    confirmPasswordValue
                ) {

                    confirmPasswordError.textContent =
                        "Mật khẩu nhập lại không khớp";

                    valid = false;
                }


                /* USERS */

                const users = getUsers();


                const exists =
                    users.find(
                        function (user) {

                            return (
                                user.phone ===
                                phoneValue
                            );
                        }
                    );


                if (exists) {

                    phoneError.textContent =
                        "Số điện thoại này đã được đăng ký";

                    return;
                }


                /* STUDENT */

                let studentData = null;


                if (
                    studentSwitch &&
                    studentSwitch.checked
                ) {

                    const educationLevel =
                        document.getElementById(
                            "educationLevel"
                        );

                    const schoolName =
                        document.getElementById(
                            "schoolName"
                        );

                    const studentId =
                        document.getElementById(
                            "studentId"
                        );

                    const cardName =
                        document.getElementById(
                            "cardName"
                        );

                    const studentExpiry =
                        document.getElementById(
                            "studentExpiry"
                        );

                    const schoolEmail =
                        document.getElementById(
                            "schoolEmail"
                        );


                    if (
                        !educationLevel.value
                    ) {

                        alert(
                            "Vui lòng chọn cấp học"
                        );

                        valid = false;
                    }


                    if (
                        !schoolName.value.trim()
                    ) {

                        alert(
                            "Vui lòng nhập tên trường"
                        );

                        valid = false;
                    }


                    if (
                        !studentId.value.trim()
                    ) {

                        alert(
                            "Vui lòng nhập mã học sinh / sinh viên"
                        );

                        valid = false;
                    }


                    if (
                        !cardName.value.trim()
                    ) {

                        alert(
                            "Vui lòng nhập tên trên thẻ"
                        );

                        valid = false;
                    }


                    if (
                        !studentExpiry.value
                    ) {

                        alert(
                            "Vui lòng nhập ngày hết hạn thẻ"
                        );

                        valid = false;
                    }


                    studentData = {

                        type:
                            document.querySelector(
                                'input[name="studentType"]:checked'
                            )?.value || "",

                        educationLevel:
                            educationLevel.value,

                        schoolName:
                            schoolName.value.trim(),

                        studentId:
                            studentId.value.trim(),

                        cardName:
                            cardName.value.trim(),

                        studentExpiry:
                            studentExpiry.value,

                        schoolEmail:
                            schoolEmail?.value.trim() || "",

                        cardFront:
                            document.getElementById("studentCardFront")?.files[0]?.name || "",

                        cardBack:
                            document.getElementById("studentCardBack")?.files[0]?.name || ""
                    };
                }


                /* BUSINESS */

                let businessData = null;


                if (
                    businessSwitch &&
                    businessSwitch.checked
                ) {

                    const inputs =
                        businessForm.querySelectorAll(
                            "input"
                        );


                    if (inputs.length >= 8) {

                        const taxCode =
                            inputs[0];

                        const companyName =
                            inputs[1];

                        const companyAddress =
                            inputs[2];

                        const companyEmail =
                            inputs[3];

                        const authorizedPerson =
                            inputs[4];

                        const note =
                            inputs[5];

                        const license =
                            document.getElementById("businessLicense") || inputs[6];

                        const authorization =
                            document.getElementById("authorizationPaper") || inputs[7];


                        if (
                            !taxCode.value.trim()
                        ) {

                            alert(
                                "Vui lòng nhập mã số thuế"
                            );

                            valid = false;
                        }


                        if (
                            !companyName.value.trim()
                        ) {

                            alert(
                                "Vui lòng nhập tên doanh nghiệp"
                            );

                            valid = false;
                        }


                        if (
                            !companyAddress.value.trim()
                        ) {

                            alert(
                                "Vui lòng nhập địa chỉ doanh nghiệp"
                            );

                            valid = false;
                        }


                        if (
                            !companyEmail.value.trim()
                        ) {

                            alert(
                                "Vui lòng nhập email doanh nghiệp"
                            );

                            valid = false;
                        }


                        if (
                            !authorizedPerson.value.trim()
                        ) {

                            alert(
                                "Vui lòng nhập CCCD / hộ chiếu"
                            );

                            valid = false;
                        }


                        if (
                            license.files.length === 0
                        ) {

                            alert(
                                "Vui lòng tải giấy phép kinh doanh"
                            );

                            valid = false;
                        }


                        if (
                            authorization.files.length === 0
                        ) {

                            alert(
                                "Vui lòng tải giấy ủy quyền"
                            );

                            valid = false;
                        }


                        businessData = {

                            taxCode:
                                taxCode.value.trim(),

                            companyName:
                                companyName.value.trim(),

                            companyAddress:
                                companyAddress.value.trim(),

                            companyEmail:
                                companyEmail.value.trim(),

                            authorizedPerson:
                                authorizedPerson.value.trim(),

                            note:
                                note.value.trim(),

                            businessLicense:
                                license.files[0]?.name || "",

                            authorizationPaper:
                                authorization.files[0]?.name || ""
                        };
                    }
                }


                if (!valid) return;


                /* CREATE USER */

                const newUser = {

                    id: Date.now(),

                    fullName:
                        fullnameValue,

                    birthday:
                        birthday?.value || "",

                    phone:
                        phoneValue,

                    email:
                        emailValue,

                    password:
                        passwordValue
                };


                if (studentData) {

                    newUser.student =
                        studentData;
                }


                if (businessData) {

                    newUser.business =
                        businessData;
                }


                users.push(newUser);

                saveUsers(users);


                if (window.parent !== window) {
                    window.parent.postMessage(
                        {
                            type: "greenphone-register-success",
                            phone: phoneValue
                        },
                        window.location.origin
                    );
                } else {
                    alert("Đăng ký tài khoản thành công!");
                    window.location.href = "login.html";
                }
            }
        );
    }
);

/* =========================================================
   SHOW / HIDE PASSWORD - LOGIN + REGISTER
   Dùng chung một handler để mắt ở cả hai ô đăng ký hoạt động ổn định.
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(
        "#showPassword, #showConfirmPassword, .password-toggle"
    ).forEach(function (button) {
        if (button.dataset.passwordBound === "1") return;
        button.dataset.passwordBound = "1";

        button.addEventListener("click", function () {
            const targetId =
                button.dataset.passwordTarget ||
                (button.id === "showConfirmPassword"
                    ? "confirmPassword"
                    : "password");

            const input = document.getElementById(targetId);
            if (!input) return;

            const visible = input.type === "password";
            input.type = visible ? "text" : "password";
            button.textContent = visible ? "🙈" : "👁";
            button.setAttribute(
                "aria-label",
                visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"
            );
        });
    });
});

/* =========================================================
   ACCOUNT PAGE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const accountPage =
            document.getElementById(
                "sidebar-username"
            );

        if (!accountPage) return;


        const user =
            getCurrentUser();


        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        renderAccount(user);

        updateAccountStats(user);

        setupProfileMenu();
        setupOrderHistory(user);
        setupAccountForms();
        setupLogout();
        setupAccountRegisterModal();

        setupNoticeClose();

    }
);


/* =========================================================
   HIỂN THỊ USER
========================================================= */

function renderAccount(user) {

    const name =
        user.fullName ||
        "Khách hàng";


    const nameElements =
        document.querySelectorAll(
            "#sidebar-username, #profile-username"
        );


    nameElements.forEach(
        function (element) {

            element.textContent =
                name;
        }
    );


    const phone =
        document.getElementById(
            "profile-phone"
        );


    if (phone) {

        phone.textContent =
            user.phone ||
            "Chưa cập nhật";
    }


    const email =
        document.getElementById(
            "profile-email"
        );


    if (email) {

        email.textContent =
            user.email ||
            "Chưa cập nhật";
    }

    const visibleFullName = document.getElementById("visible-fullName");
    const visiblePhone = document.getElementById("visible-phone");
    const visibleEmail = document.getElementById("visible-email");
    const visibleBirthday = document.getElementById("visible-birthday");
    const visibleGender = document.getElementById("visible-gender");
    const visibleAddress = document.getElementById("visible-address");
    const visibleAddressCard = document.getElementById("visible-address-card");

    if (visibleFullName) visibleFullName.textContent = user.fullName || "Chưa cập nhật";
    if (visiblePhone) visiblePhone.textContent = user.phone || "Chưa cập nhật";
    if (visibleEmail) visibleEmail.textContent = user.email || "Chưa cập nhật";
    if (visibleBirthday) visibleBirthday.textContent = user.birthday || "-";
    if (visibleGender) visibleGender.textContent = user.gender || "-";
    if (visibleAddress) visibleAddress.textContent = user.address || "-";

    if (visibleAddressCard) {
        if (user.address) {
            visibleAddressCard.className = "visible-address-card";
            visibleAddressCard.innerHTML =
                '<strong>Địa chỉ nhận hàng</strong>' +
                '<p>' + escapeHtml(user.address) + '</p>' +
                '<button type="button" class="btn btn-outline" data-open-panel="account-address-panel">✎ Sửa địa chỉ</button>';
        } else {
            visibleAddressCard.className = "visible-address-empty";
            visibleAddressCard.innerHTML =
                '<div class="visible-address-icon">📍</div>' +
                '<p>Bạn chưa có địa chỉ nhận hàng nào.</p>' +
                '<button type="button" class="btn btn-outline" data-open-panel="account-address-panel">Thêm địa chỉ đặt đơn</button>';
        }
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   THỐNG KÊ
========================================================= */

function updateAccountStats(user) {

    let orders = [];


    try {

        orders =
            JSON.parse(
                localStorage.getItem(
                    "orders"
                )
            ) || [];

    } catch (error) {

        orders = [];
    }


    const userOrders =
        orders.filter(
            function (order) {

                return (
                    order.userId === user.id ||
                    order.phone === user.phone
                );
            }
        );


    const totalOrders =
        userOrders.length;


    let totalMoney = 0;


    userOrders.forEach(
        function (order) {

            totalMoney += Number(
                order.total ??
                order.totalAmount ??
                order.amount ??
                0
            );
        }
    );


    const totalOrdersElement =
        document.getElementById(
            "total-orders"
        );


    if (totalOrdersElement) {

        totalOrdersElement.textContent =
            totalOrders;
    }


    const totalMoneyElement =
        document.getElementById(
            "total-money"
        );


    if (totalMoneyElement) {

        totalMoneyElement.textContent =
            totalMoney.toLocaleString(
                "vi-VN"
            ) + "₫";
    }
}


/* =========================================================
   MENU
========================================================= */

function setupProfileMenu() {

    const items =
        document.querySelectorAll(
            ".profile-menu-item"
        );

    const panelMap = {
        profile: "account-info-panel",
        address: "account-address-panel",
        password: "account-password-panel"
    };

    items.forEach(function (item) {
        item.addEventListener("click", function () {
            const page = item.dataset.page;
            if (page === "logout") return;

            items.forEach(function (menu) { menu.classList.remove("active"); });
            item.classList.add("active");

            const content = document.querySelector(".profile-content");
            const orderPage = document.getElementById("order-history-page");
            if (page === "orders") {
                if (content) Array.from(content.children).forEach(function (child) {
                    if (child !== orderPage) child.hidden = true;
                });
                if (orderPage) orderPage.hidden = false;
                renderOrderHistory();
                return;
            }
            if (content) Array.from(content.children).forEach(function (child) {
                child.hidden = false;
            });
            if (orderPage) orderPage.hidden = true;

            if (panelMap[page]) {
                openAccountPanel(panelMap[page]);
                return;
            }
            if (page !== "overview") alert("Chức năng này đang được phát triển.");
        });
    });
}

function openAccountPanel(panelId) {
    document.querySelectorAll(".account-panel").forEach(function (panel) {
        panel.classList.remove("is-open");
    });

    const panel = document.getElementById(panelId);
    if (!panel) return;

    panel.classList.add("is-open");
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setupAccountForms() {
    const user = getCurrentUser();
    if (!user) return;

    const fullName = document.getElementById("account-fullName");
    const phone = document.getElementById("account-phone");
    const email = document.getElementById("account-email");
    const gender = document.getElementById("account-gender");
    const birthday = document.getElementById("account-birthday");
    const address = document.getElementById("account-address");

    if (fullName) fullName.value = user.fullName || "";
    if (phone) phone.value = user.phone || "";
    if (email) email.value = user.email || "";
    if (gender) gender.value = user.gender || "";
    if (birthday) birthday.value = user.birthday || "";
    if (address) address.value = user.address || "";

    const infoForm = document.getElementById("account-info-form");
    if (infoForm) {
        infoForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const users = getUsers();
            const current = getCurrentUser();
            const index = users.findIndex(function (u) {
                return u.id === current.id || u.phone === current.phone;
            });

            if (index < 0) return;

            const updated = {
                ...users[index],
                fullName: fullName.value.trim(),
                phone: phone.value.trim(),
                email: email.value.trim(),
                gender: gender ? gender.value : (users[index].gender || ""),
                birthday: birthday ? birthday.value : (users[index].birthday || "")
            };

            if (!updated.fullName || !updated.phone) {
                alert("Vui lòng nhập đầy đủ họ tên và số điện thoại.");
                return;
            }

            users[index] = updated;
            saveUsers(users);
            localStorage.setItem("currentUser", JSON.stringify(updated));
            renderAccount(updated);

            if (typeof renderHeader === "function") {
                renderHeader();
            }

            alert("Đã cập nhật thông tin tài khoản.");
        });
    }

    const addressForm = document.getElementById("account-address-form");
    if (addressForm) {
        addressForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const users = getUsers();
            const current = getCurrentUser();
            const index = users.findIndex(function (u) {
                return u.id === current.id || u.phone === current.phone;
            });

            if (index < 0) return;

            users[index].address = address.value.trim();
            saveUsers(users);

            const updated = { ...users[index] };
            localStorage.setItem("currentUser", JSON.stringify(updated));
            alert(address.value.trim()
                ? "Đã lưu địa chỉ đặt đơn."
                : "Đã xóa địa chỉ đặt đơn.");
        });
    }

    const passwordForm = document.getElementById("account-password-form");
    if (passwordForm) {
        passwordForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const currentPassword = document.getElementById("current-password").value;
            const newPassword = document.getElementById("new-password").value;
            const confirmPassword = document.getElementById("confirm-new-password").value;

            const latestUser = getCurrentUser() || user;
            if (currentPassword !== latestUser.password) {
                alert("Mật khẩu hiện tại không đúng.");
                return;
            }

            if (newPassword.length < 6) {
                alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
                return;
            }

            if (newPassword !== confirmPassword) {
                alert("Mật khẩu nhập lại không khớp.");
                return;
            }

            const users = getUsers();
            const current = getCurrentUser();
            const index = users.findIndex(function (u) {
                return u.id === current.id || u.phone === current.phone;
            });

            if (index < 0) return;

            users[index].password = newPassword;
            saveUsers(users);
            localStorage.setItem("currentUser", JSON.stringify(users[index]));
            passwordForm.reset();

            alert("Đổi mật khẩu thành công.");
        });
    }

    document.querySelectorAll("[data-open-panel]").forEach(function (button) {
        button.addEventListener("click", function () {
            openAccountPanel(button.dataset.openPanel);
        });
    });



    const backButton = document.getElementById("profile-back-btn");
    if (backButton) {
        backButton.addEventListener("click", function () {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = "index.html";
            }
        });
    }
}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const logout =
        document.querySelector(
            ".profile-logout"
        );


    if (!logout) return;


    logout.addEventListener(
        "click",
        function () {

            const ok =
                confirm(
                    "Bạn có chắc muốn đăng xuất không?"
                );


            if (!ok) return;


            localStorage.removeItem(
                "currentUser"
            );


            window.location.href =
                "index.html";
        }
    );
}


/* =========================================================
   MODAL ĐĂNG KÝ G-STUDENT / G-BUSINESS TRÊN TRANG TÀI KHOẢN
========================================================= */
function setupAccountRegisterModal() {
    const modal = document.getElementById("accountRegisterModal");
    const frame = document.getElementById("accountRegisterFrame");
    const title = document.getElementById("account-register-modal-title");
    const themeButton = document.getElementById("registerModalThemeToggle");
    if (!modal || !frame) return;

    function syncModalThemeButton() {
        if (!themeButton) return;
        const dark = document.body.classList.contains("theme-dark");
        themeButton.innerHTML = dark
            ? '<svg class="gp-theme-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
            : '<svg class="gp-theme-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.6 8.6 0 1 0 20.2 15.2Z"/></svg>';
        themeButton.setAttribute("aria-label", dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
        themeButton.title = dark ? "Light mode" : "Dark mode";
    }

    if (themeButton) {
        syncModalThemeButton();
        themeButton.addEventListener("click", function () {
            const dark = !document.body.classList.contains("theme-dark");
            document.body.classList.toggle("theme-dark", dark);
            localStorage.setItem("greenphone-theme", dark ? "dark" : "light");
            syncModalThemeButton();
            // Đồng bộ ngay theme vào iframe đang mở.
            try {
                if (frame.contentDocument && frame.contentDocument.body) {
                    frame.contentDocument.body.classList.toggle("theme-dark", dark);
                }
            } catch (error) {}
        });
    }

    function closeModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        frame.src = "about:blank";
    }

    function openModal(type, event) {
        if (event) event.preventDefault();
        const mode = type === "business" ? "business" : "student";
        if (title) {
            title.textContent = mode === "business"
                ? "Đăng ký G-Business"
                : "Đăng ký G-Student / G-Teacher";
        }
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        frame.src = "register-modal.html?modal=1&type=" + encodeURIComponent(mode);
    }

    document.querySelectorAll(".open-account-register").forEach(function (link) {
        link.addEventListener("click", function (event) {
            openModal(link.dataset.registerType, event);
        });
    });

    modal.querySelectorAll("[data-close-account-register]").forEach(function (element) {
        element.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            closeModal();
        }
    });

    window.addEventListener("message", function (event) {
        if (event.origin !== window.location.origin) return;
        if (!event.data || event.data.type !== "greenphone-register-success") return;
        closeModal();
        alert("Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.");
    });
}


/* =========================================================
   ĐÓNG THÔNG BÁO
========================================================= */

function setupNoticeClose() {

    const buttons =
        document.querySelectorAll(
            ".profile-notice-close"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const notice =
                        button.closest(
                            ".profile-notice"
                        );


                    if (notice) {

                        notice.remove();
                    }
                }
            );
        }
    );
}

/* =========================================================
   QUÊN MẬT KHẨU
   Đặt lại mật khẩu bằng số điện thoại + email đã đăng ký.
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    const forgotForm = document.getElementById("forgotPasswordForm");
    if (!forgotForm) return;

    const message = document.getElementById("forgotMessage");
    const phoneInput = document.getElementById("forgotPhone");
    const emailInput = document.getElementById("forgotEmail");
    const newPasswordInput = document.getElementById("forgotNewPassword");
    const confirmInput = document.getElementById("forgotConfirmPassword");

    function showForgotMessage(text, type) {
        if (!message) return;
        message.textContent = text;
        message.className = "forgot-message " + (type || "");
    }

    function toggleForgotPassword(inputId, button) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const visible = input.type === "password";
        input.type = visible ? "text" : "password";
        button.textContent = visible ? "🙈" : "👁";
        button.setAttribute(
            "aria-label",
            visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"
        );
    }

    document.querySelectorAll("[data-forgot-password-target]").forEach(function (button) {
        button.addEventListener("click", function () {
            toggleForgotPassword(button.dataset.forgotPasswordTarget, button);
        });
    });

    forgotForm.addEventListener("submit", function (event) {
        event.preventDefault();
        showForgotMessage("", "");

        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmInput.value;

        if (!/^0\d{9}$/.test(phone)) {
            showForgotMessage(
                "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.",
                "error"
            );
            return;
        }

        if (!isValidEmail(email)) {
            showForgotMessage("Email không hợp lệ.", "error");
            return;
        }

        if (newPassword.length < 6) {
            showForgotMessage("Mật khẩu mới phải có ít nhất 6 ký tự.", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showForgotMessage("Mật khẩu nhập lại không khớp.", "error");
            return;
        }

        const users = getUsers();
        const index = users.findIndex(function (user) {
            return (
                user.phone === phone &&
                String(user.email || "").trim().toLowerCase() === email
            );
        });

        if (index < 0) {
            showForgotMessage(
                "Không tìm thấy tài khoản phù hợp với số điện thoại và email này.",
                "error"
            );
            return;
        }

        users[index].password = newPassword;
        saveUsers(users);

        /* Nếu chính tài khoản hiện tại được đặt lại mật khẩu,
           cập nhật luôn dữ liệu phiên đăng nhập. */
        const currentUser = getCurrentUser();
        if (
            currentUser &&
            (currentUser.id === users[index].id ||
             currentUser.phone === users[index].phone)
        ) {
            localStorage.setItem(
                "currentUser",
                JSON.stringify(users[index])
            );
        }

        forgotForm.reset();
        showForgotMessage(
            "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.",
            "success"
        );

        setTimeout(function () {
            window.location.href = "login.html";
        }, 900);
    });
});


/* =========================================================
   LOGIN - LINK ĐĂNG KÝ
   "Đăng ký ngay" trên trang login.html -> register.html.
   Popup chỉ dùng ở account.html/profile.
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("registerModal");
    const frame = document.getElementById("registerModalFrame");
    // Nút "Đăng ký ngay" trên TRANG ĐĂNG NHẬP phải chuyển sang
    // trang register.html, KHÔNG mở popup.
    // Popup đăng ký chỉ được dùng ở trang profile/account.html.
    const openLinks = document.querySelectorAll("#benefit-register-link");
    if (!modal || !frame) return;

    function closeRegisterModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        frame.src = "about:blank";
    }

    function openRegisterModal(event) {
        if (event) event.preventDefault();
        const title = document.getElementById("register-modal-title");
        if (title) title.textContent = "Đăng ký G-Student / G-Teacher";
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        frame.src = "register-modal.html?modal=1&type=student";
    }

    openLinks.forEach(function (link) {
        link.addEventListener("click", openRegisterModal);
    });

    modal.querySelectorAll("[data-close-register]").forEach(function (element) {
        element.addEventListener("click", closeRegisterModal);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            closeRegisterModal();
        }
    });

    window.addEventListener("message", function (event) {
        if (event.origin !== window.location.origin) return;
        if (!event.data || event.data.type !== "greenphone-register-success") return;

        closeRegisterModal();
        alert("Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.");
        const phone = document.getElementById("phone");
        if (phone && event.data.phone) phone.value = event.data.phone;
    });
});

/* Nút mở panel tạo lại sau khi render nội dung địa chỉ động */
document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-open-panel]");
    if (!button) return;
    const panelId = button.dataset.openPanel;
    if (typeof openAccountPanel === "function") {
        event.preventDefault();
        openAccountPanel(panelId);
    }
});


/* =========================================================
   LỊCH SỬ MUA HÀNG
========================================================= */
let activeOrderStatus = "all";
let orderHistoryUser = null;

function setupOrderHistory(user) {
    orderHistoryUser = user;
    const tabs = document.querySelectorAll("[data-order-status]");
    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            activeOrderStatus = tab.dataset.orderStatus || "all";
            tabs.forEach(function (other) { other.classList.toggle("active", other === tab); });
            renderOrderHistory();
        });
    });
    ["orders-date-from", "orders-date-to"].forEach(function (id) {
        const input = document.getElementById(id);
        if (input) input.addEventListener("change", renderOrderHistory);
    });
    const reset = document.getElementById("orders-date-reset");
    if (reset) reset.addEventListener("click", function () {
        document.getElementById("orders-date-from").value = "";
        document.getElementById("orders-date-to").value = "";
        renderOrderHistory();
    });
}

function normalizeOrderStatus(order) {
    const raw = String(order.status || order.orderStatus || order.state || "pending").toLowerCase();
    if (/cancel|hủy|huỷ|đã huỷ|đã hủy/.test(raw)) return "cancelled";
    if (/complete|delivered|received|đã nhận|hoàn thành|thành công/.test(raw)) return "completed";
    if (/ship|deliver|vận chuyển|đang giao|đang vận chuyển/.test(raw)) return "shipping";
    if (/process|confirm|đang xử lý|đã xác nhận/.test(raw)) return "processing";
    return "pending";
}

function getOrderDate(order) {
    const value = order.createdAt || order.orderDate || order.date || order.created_at || order.timestamp || "";
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function renderOrderHistory() {
    const list = document.getElementById("order-history-list");
    if (!list) return;
    let orders = [];
    try { orders = JSON.parse(localStorage.getItem("orders") || "[]"); } catch (e) { orders = []; }
    if (!Array.isArray(orders)) orders = [];
    const user = orderHistoryUser || (typeof getCurrentUser === "function" ? getCurrentUser() : null);
    const mine = orders.filter(function (order) {
        if (!user) return false;
        return order.userId === user.id || order.phone === user.phone || order.customerPhone === user.phone || order.userPhone === user.phone;
    });
    const fromValue = document.getElementById("orders-date-from")?.value || "";
    const toValue = document.getElementById("orders-date-to")?.value || "";
    const filtered = mine.filter(function (order) {
        const status = normalizeOrderStatus(order);
        if (activeOrderStatus !== "all" && status !== activeOrderStatus) return false;
        const date = getOrderDate(order);
        if (fromValue && (!date || date < new Date(fromValue + "T00:00:00"))) return false;
        if (toValue && (!date || date > new Date(toValue + "T23:59:59"))) return false;
        return true;
    }).sort(function (a, b) { return (getOrderDate(b)?.getTime() || 0) - (getOrderDate(a)?.getTime() || 0); });

    if (!filtered.length) {
        list.innerHTML = '<div class="order-history-empty"><div class="order-empty-illustration">🛍️</div><p>' + (mine.length ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc.' : 'Bạn chưa có đơn hàng nào') + '</p><a href="index.html">Trang chủ</a></div>';
        return;
    }
    const labels = { pending: "Chờ xác nhận", processing: "Đang xử lý", shipping: "Đang vận chuyển", completed: "Đã nhận hàng", cancelled: "Đã hủy" };
    list.innerHTML = filtered.map(function (order) {
        const status = normalizeOrderStatus(order);
        const date = getOrderDate(order);
        const dateText = date ? date.toLocaleDateString("vi-VN") : "Chưa có ngày đặt";
        const id = order.orderId || order.code || order.id || "—";
        const total = Number(order.total ?? order.totalAmount ?? order.amount ?? 0);
        const items = Array.isArray(order.items) ? order.items : (Array.isArray(order.products) ? order.products : []);
        const summary = items.length ? items.map(function (item) { return escapeHtml(item.name || item.title || item.productName || "Sản phẩm") + ' × ' + Number(item.quantity || item.qty || 1); }).join(", ") : escapeHtml(order.productName || order.product || "Đơn hàng GreenPhone");
        return '<article class="order-history-card"><div class="order-history-card-head"><strong>Mã đơn: ' + escapeHtml(id) + '</strong><span class="order-status-pill status-' + status + '">' + labels[status] + '</span></div><div class="order-history-meta"><span>Ngày đặt: ' + dateText + '</span><span>' + summary + '</span></div><div class="order-history-card-foot"><strong>Tổng tiền: ' + total.toLocaleString("vi-VN") + '₫</strong></div></article>';
    }).join("");
}
