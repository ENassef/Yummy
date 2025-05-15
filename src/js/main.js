import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

jQuery(function ($) {
    function hideLoading() {
        $(".loding").addClass("hidden");
        $("body").removeClass("overflow-hidden");
    }

    function showLoading() {
        $("body").addClass("overflow-hidden");
        $(".loding").removeClass("hidden");
    }

    hideLoading();

    let isNavOpen = false;
    let currentPage = "home";

    let apiUrl = {
        Home: "https://www.themealdb.com/api/json/v1/1/search.php?s=",
        SearchName: "https://www.themealdb.com/api/json/v1/1/search.php?s=",
        SearchFirstLetter:"https://www.themealdb.com/api/json/v1/1/search.php?f=",
        Category: "https://www.themealdb.com/api/json/v1/1/categories.php",
        Area: "https://www.themealdb.com/api/json/v1/1/list.php?a=list",
        ingredient: "https://www.themealdb.com/api/json/v1/1/list.php?i=",
        FilterC: "https://www.themealdb.com/api/json/v1/1/filter.php?c=",
        FilterI: "https://www.themealdb.com/api/json/v1/1/filter.php?i=",
        FilterA: "https://www.themealdb.com/api/json/v1/1/filter.php?a=",
        mealID: "https://www.themealdb.com/api/json/v1/1/lookup.php?i=",
    };

    gsap.set(".list li", { y: 50, opacity: 0 });

    function toggleSideBar() {
        gsap.to("#bars", {
            duration: 0.5,
            scale: 1,
            rotate: 360,
            ease: "power1.inOut",
        });
        gsap.set("#bars", {
            scale: 0,
            rotate: 0,
        });

        isNavOpen = !isNavOpen;

        if (isNavOpen) {
            $("nav").animate(
                {
                    left: $("nav").outerWidth(),
                },
                500,
                function () {
                    const items = $(".list li");
                    const totalDuration = 1;
                    const staggerTime = totalDuration / items.length;

                    gsap.to(".list li", {
                        opacity: 1,
                        y: 0,
                        duration: staggerTime,
                        stagger: {
                            each: staggerTime,
                            from: "start",
                            ease: "linear",
                        },
                    });
                }
            );
        } else {
            $("nav").animate(
                {
                    left: 0,
                },
                500,
                function () {
                    gsap.to(".list li", {
                        y: 100,
                        opacity: 0,
                        duration: 0.1,
                        stagger: {
                            each: 0.15,
                            from: "end",
                            ease: "linear",
                        },
                    });
                }
            );
        }
    }

    function toggleNavIcon() {
        $("#bars").toggleClass("fa-bars");
        $("#bars").toggleClass("fa-xmark");
    }

    $("#bars").on("click", function () {
        toggleNavIcon();
        toggleSideBar();
    });

    $(".list li").on("click", function () {
        currentPage = $(this).html().trim().toLowerCase();
        toggleNavIcon();
        toggleSideBar();
        renderData();
    });

    async function fetchData(url = apiUrl.Home, endPoint = "") {
        const response = await fetch(url + endPoint);
        const data = await response.json();
        return data;
    }

    function renderData(url = apiUrl.Home, endPoint = "", Search = null) {

        if (currentPage === "home") {
            showLoading();
            fetchData(url, endPoint)
                .then((data) => {
                    $("#content").html(
                        '<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" id="meals"></div>'
                    );

                    data.meals.forEach((meal, index) => {
                        const mealID = meal.idMeal;
                        const mealName = meal.strMeal;
                        const mealImage = meal.strMealThumb;

                        const currentMealIngredients = [];
                        const currentMealMeasures = [];

                        for (let i = 1; i <= 20; i++) {
                            const ingredient = meal[`strIngredient${i}`];
                            if (ingredient && ingredient.trim() !== "") {
                                currentMealIngredients.push(ingredient);
                                currentMealMeasures.push(
                                    meal[`strMeasure${i}`] || ""
                                );
                            }
                        }


                        const mealCard = `
                        <div class="overflow-hidden relative cursor-pointer meal rounded-2xl shadow-lg transition-all duration-300 group"
                            data-aos="fade-up" 
                            data-aos-delay="${index < 12 ? index * 100 : 100}"
                            data-mealID="${mealID}">
                            <img src="${mealImage}" alt="${mealName}" 
                                class="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"/>
                            <div class="absolute inset-0 bg-[rgba(255,255,255,0.5)] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <h1 class="text-3xl text-black font-bold px-4 text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                                    ${mealName}
                                </h1>
                            </div>
                            ${
                                meal.strCategory
                                    ? `
                            <div class="absolute top-3 left-3 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md transition-opacity duration-300 group-hover:opacity-0"
                                data-aos="fade-right">
                                ${meal.strCategory}
                            </div>
                            `
                                    : ""
                            }
                        </div>
                    `;

                        $("#meals").append(mealCard);
                    });

                    $(".meal").on("click", function () {
                        currentPage = "meal";
                        const mealID = $(this).attr("data-mealID");
                        renderData(apiUrl.mealID, "", mealID);
                    });

                    hideLoading();
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                });
        }

        if (currentPage === "meal") {
            showLoading();
            fetchData(apiUrl.mealID, Search)
                .then((data) => {
                    const meals = data.meals[0];
                    let ingredientsHTML = "";

                    for (let i = 1; i <= 20; i++) {
                        const ingredient = meals[`strIngredient${i}`];
                        const measure = meals[`strMeasure${i}`];
                        if (ingredient && ingredient.trim() !== "") {
                            ingredientsHTML += `
                            <p class="py-1 px-2 bg-sky-200 text-[#055160] border-[#b6effb] rounded-[6px]">
                            ${measure ? `${measure} ` : ""}${ingredient}
                            </p>
                        `;
                        }
                    }

                    $("#content").html(`
                    <div class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
                        <div class="rounded-[20px]" data-aos="flip-left" data-aos-duration="800">
                            <img src="${
                                meals.strMealThumb
                            }" alt="Delicious meal image from TheMealDB" 
                                class="w-full rounded-[20px] object-cover aspect-square md:aspect-auto shadow-xl" 
                                data-aos="zoom-in" data-aos-delay="200"/>
                            <p class="font-bold text-2xl md:text-4xl mt-3 px-3 text-white italic" 
                            data-aos="fade-up" data-aos-delay="400">${
                                data.meals[0].strMeal
                            }</p>
                        </div>

                        <div class="flex flex-col justify-start pt-0 md:pt-3 text-white italic mb-3">
                            <h2 class="font-semibold text-3xl md:text-4xl pb-3" 
                                data-aos="fade-left" data-aos-delay="100">Instructions</h2>
                            <p class="text-base md:text-lg" 
                            data-aos="fade-left" data-aos-delay="200" data-aos-duration="600">${
                                meals.strInstructions
                            }</p>
                            
                            <div class="grid grid-cols-2 gap-2 md:block" data-aos="fade-up" data-aos-delay="300">
                                <p class="py-1.5"><span class="font-bold text-xl md:text-2xl">Area: ${
                                    meals.strArea
                                }</span></p>
                                <p class="py-1.5"><span class="font-bold text-xl md:text-2xl">Category: ${
                                    meals.strCategory
                                }</span></p>
                            </div>
                            
                            <p class="py-1.5" data-aos="fade-right" data-aos-delay="400">
                                <span class="font-bold text-xl md:text-2xl">Recipes:</span>
                            </p>
                            <div class="flex flex-wrap gap-2 py-2 md:py-4 md:gap-4" 
                                data-aos="zoom-in-up" data-aos-delay="500">
                                ${ingredientsHTML}
                            </div>
                            
                            <div id="tags" class="space-y-2 md:space-y-0 md:space-x-3">
                                <p class="py-1.5 font-bold text-xl md:text-2xl mb-1 md:mb-3" 
                                data-aos="fade-down" data-aos-delay="600">Tags:</p>
                                <div class="flex flex-wrap gap-2" 
                                    data-aos="flip-up" data-aos-delay="700" data-aos-duration="500">
                                    ${
                                        meals.strSource
                                            ? `<span><a class="bg-green-700 py-1 px-2 md:py-2 md:px-3 font-bold text-shadow-lg rounded-lg text-sm md:text-base hover:scale-105 transition-transform" href="${meals.strSource}" target='_blank'>Source</a></span>`
                                            : ""
                                    }
                                    ${
                                        meals.strYoutube
                                            ? `<span><a class="bg-red-600 py-1 px-2 md:py-2 md:px-3 font-bold text-shadow-lg rounded-lg text-sm md:text-base hover:scale-105 transition-transform" href="${meals.strYoutube}" target='_blank'>Youtube</a></span>`
                                            : ""
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                `);

                    hideLoading();
                })
                .catch((error) => {
                    console.error("Error fetching meal details:", error);
                });
        }

        if (currentPage === "search") {
            showLoading();
            $("#content").html(`
                <div class='flex flex-wrap justify-center space-x-6 relative'>
                    <input type="text" id="Name" placeholder='Search By Name' class='z-50 border border-white rounded-lg px-4 py-3 placeholder-white text-white text-xl'>
                    <input type="text" id="FLetter" placeholder='Search By First Letter' class='z-50 border border-white rounded-lg px-4 py-3 placeholder-white text-white text-xl' maxlength="1">
                    <div id="filteredData" class='w-full mt-5'></div>
                </div>
            `);

            hideLoading();

            $("#Name").on("input", function () {
                showLoading();
                if ($(this).val() == "") {
                    hideLoading();
                }

                const searchQuery = $(this).val().trim();
                $("#FLetter").val("");
                $("#filteredData").html("");

                if (searchQuery !== "") {
                    fetchData(apiUrl.SearchName, searchQuery)
                        .then((data) => {
                            if (!data.meals) {
                                $("#filteredData").html(
                                    '<p class="text-white">No meals found</p>'
                                );
                                hideLoading();
                                return;
                            }

                            const mealsHTML = data.meals
                                .map(
                                    (meal, index) => `
                                <div class="overflow-hidden relative cursor-pointer meal rounded-2xl shadow-lg transition-all duration-300 group" 
                                    data-mealID="${meal.idMeal}"
                                    data-aos="fade-up" 
                                    data-aos-delay="${index * 100}">
                                    
                                    <img src="${meal.strMealThumb}" alt="${
                                        meal.strMeal
                                    }" 
                                        class="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"/>
                                    
                                    <div class="absolute inset-0 bg-[rgba(255,255,255,0.5)] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <h1 class="text-3xl text-black font-bold px-4 text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                                            ${meal.strMeal}
                                        </h1>
                                    </div>
                                    
                                    ${
                                        meal.strCategory
                                            ? `
                                    <div class="absolute top-3 left-3 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md transition-opacity duration-300 group-hover:opacity-0"
                                        data-aos="fade-right"
                                        data-aos-delay="${index * 100 + 200}">
                                        ${meal.strCategory}
                                    </div>
                                    `
                                            : ""
                                    }
                                </div>
                            `
                                )
                                .join("");

                            $("#filteredData").html(`
                                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    ${mealsHTML}
                                </div>
                            `);

                            $(".meal").on("click", function () {
                                currentPage = "meal";
                                const mealID = $(this).attr("data-mealID");
                                renderData(apiUrl.mealID, "", mealID);
                            });

                            hideLoading();
                        })
                        .catch((error) => {
                            console.error("Search error:", error);
                            $("#filteredData").html(
                                '<p class="text-red-500">Error loading results</p>'
                            );
                            hideLoading();
                        });
                }
            });

            $("#FLetter").on("input", function () {
                showLoading();
                const searchQuery = $(this).val().trim();

                $("#Name").val("");
                $("#filteredData").html("");

                if (searchQuery === "") {
                    hideLoading();
                    return;
                }

                if (
                    searchQuery.length !== 1 ||
                    !searchQuery.match(/[a-zA-Z]/)
                ) {
                    $("#filteredData").html(
                        '<p class="text-white">Please enter a single letter (A-Z)</p>'
                    );
                    hideLoading();
                    return;
                }

                fetchData(apiUrl.SearchFirstLetter, searchQuery)
                    .then((data) => {
                        if (!data.meals) {
                            $("#filteredData").html(
                                '<p class="text-white">No meals found starting with "' +
                                    searchQuery +
                                    '"</p>'
                            );
                            hideLoading();
                            return;
                        }

                        const mealsHTML = data.meals
                            .map(
                                (meal, index) => `
                                <div class="overflow-hidden relative cursor-pointer meal rounded-2xl shadow-lg transition-all duration-300 group"
                                    data-mealID="${meal.idMeal}"
                                    data-aos="fade-up"
                                    data-aos-delay="${index * 100}">
                                    
                                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}"
                                        class="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"/>
                                    
                                    <div class="absolute inset-0 bg-[rgba(255,255,255,0.7)] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <h1 class="text-3xl text-black font-bold px-4 text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                                            ${meal.strMeal}
                                        </h1>
                                    </div>
                                    
                                    ${
                                        meal.strCategory
                                            ? `
                                    <div class="absolute top-3 left-3 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                                        ${meal.strCategory}
                                    </div>
                                    `
                                            : ""
                                    }
                                </div>
                                `
                                ).join("");

                        $("#filteredData").html(`
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    ${mealsHTML}
                </div>
            `);

                        $(".meal").on("click", function () {
                            currentPage = "meal";
                            const mealID = $(this).attr("data-mealID");
                            renderData(apiUrl.mealID, "", mealID);
                        });

                        hideLoading();
                    })
                    .catch((error) => {
                        console.error("Search error:", error);
                        $("#filteredData").html(
                            '<p class="text-red-500">Error loading results. Please try again.</p>'
                        );
                        hideLoading();
                    });
            });
        }

        if (currentPage === "categories") {
            showLoading();
            fetchData(apiUrl.Category)
                .then((data) => {
                    const mealsHTML = data.categories
                        .map(
                            (meal, index) => `
                    <div class="overflow-hidden relative cursor-pointer meal rounded-2xl shadow-lg transition-all duration-300 group"
                        data-aos="fade-up"
                        data-aos-delay="${index * 100}"
                        data-Catg="${meal.strCategory}">
                        
                        <img src="${meal.strCategoryThumb}" alt="${
                                meal.strCategory
                            }" 
                            class="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"/>
                        
                        <div class="absolute inset-0 bg-[rgba(255,255,255,0.5)] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <h1 class="md:text-2xl text-3xl lg:text-3xl text-black font-bold px-4 text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                                ${meal.strCategory}
                            </h1>
                        </div>
                    </div>
                `
                        )
                        .join("");

                    $("#content").html(
                        `<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" id="meals">${mealsHTML}</div>`
                    );

                    $(".meal").on("click", function () {
                        currentPage = "filterC";
                        const Catg = $(this).attr("data-Catg");
                        renderData(apiUrl.FilterC, "", Catg);
                    });

                    hideLoading();
                })
                .catch((error) => {
                    console.error("Categories error:", error);
                    $("#content").html(
                        '<p class="text-red-500">Error loading results</p>'
                    );
                    hideLoading();
                });
        }

        if (currentPage === "filterC") {
            showLoading();

            fetchData(apiUrl.FilterC, Search)
                .then((data) => {
                    const mealsHTML = data.meals
                        .map(
                            (meal, index) => `
                    <div class="overflow-hidden relative cursor-pointer meal rounded-2xl shadow-lg transition-all duration-300 group"
                        data-aos="fade-up"
                        data-aos-delay="${index * 100}"
                        data-mealID="${meal.idMeal}">
                        
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" 
                            class="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"/>
                        
                        <div class="absolute inset-0 bg-[rgba(255,255,255,0.5)] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <h1 class="text-3xl text-black font-bold px-4 text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                                ${meal.strMeal}
                            </h1>
                        </div>
                    </div>
                `
                        )
                        .join("");

                    $("#content").html(
                        `<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" id="meals">${mealsHTML}</div>`
                    );

                    $(".meal").on("click", function () {
                        currentPage = "meal";
                        const mealID = $(this).attr("data-mealID");
                        renderData(apiUrl.mealID, "", mealID);
                    });

                    hideLoading();
                })
                .catch((error) => {
                    console.error("Filter error:", error);
                    $("#content").html(
                        '<p class="text-red-500">Error loading results</p>'
                    );
                    hideLoading();
                });
        }

        if (currentPage === "area") {
            showLoading();
            fetchData(apiUrl.Area)
                .then((data) => {
                    const areaHtml = data.meals
                        .map(
                            (meal, index) => `
                    <div class="flex flex-col items-center justify-center p-4 rounded-lg bg-black group cursor-pointer area"
                        data-aos="fade-up"
                        data-area="${meal.strArea}">
                        <div class="mb-1">
                            <i class="fa-solid fa-house-laptop text-6xl md:text-8xl text-white transition-transform duration-300 group-hover:scale-110"></i>
                        </div>
                        <p class="text-white font-medium px-3 py-2 w-full text-center text-xl md:text-2xl transition-transform duration-300 group-hover:scale-110">
                            ${meal.strArea}
                        </p>
                    </div>
                `
                        )
                        .join("");

                    $("#content").html(
                        `<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" id="meals">${areaHtml}</div>`
                    );

                    $(".area").on("click", function () {
                        currentPage = "filterA";
                        const area = $(this).attr("data-area");
                        renderData(apiUrl.FilterA, "", area);
                    });

                    hideLoading();
                })
                .catch((error) => {
                    console.error("Area error:", error);
                    $("#content").html(
                        '<p class="text-red-500">Error loading results</p>'
                    );
                    hideLoading();
                });
        }

        if (currentPage === "filterA") {
            showLoading();
            fetchData(apiUrl.FilterA, Search)
                .then((data) => {
                    const mealsHTML = data.meals
                        .map(
                            (meal, index) => `
                            <div class="overflow-hidden relative cursor-pointer meal rounded-2xl shadow-lg transition-all duration-300 group"
                                data-aos="fade-up"
                                data-aos-delay="${index * 100}"
                                data-mealID="${meal.idMeal}">
                                
                                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" 
                                    class="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"/>
                                
                                <div class="absolute inset-0 bg-[rgba(255,255,255,0.5)] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <h1 class="text-3xl text-black font-bold px-4 text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                                        ${meal.strMeal}
                                    </h1>
                                </div>
                            </div>
                        `
                        )
                        .join("");

                    $("#content").html(
                        `<div class="grid grid-cols-1 md:grid-cols-Array
                        3 lg:grid-cols-4 gap-6" id="meals">${mealsHTML}</div>`
                    );

                    $(".meal").on("click", function () {
                        currentPage = "meal";
                        const mealID = $(this).attr("data-mealID");
                        renderData(apiUrl.mealID, "", mealID);
                    });

                    hideLoading();
                    })
                    .catch((error) => {
                        console.error("Filter by Area error:", error);
                        $("#content").html(
                            '<p class="text-red-500">Error loading results</p>'
                        );
                        hideLoading();
                    });
        }

        if (currentPage === "ingredients") {
            showLoading();
            fetchData(apiUrl.ingredient)
                .then((data) => {
                    const itemsPerPage = 12;
                    let currentIngredientPage = 1;
                    const totalItems = data.meals.length;
                    const totalPages = Math.ceil(totalItems / itemsPerPage);

                    function renderIngredients(page) {
                        const start = (page - 1) * itemsPerPage;
                        const end = start + itemsPerPage;
                        const paginatedIngredients = data.meals.slice(start, end);

                        const ingredientsHTML = paginatedIngredients
                            .map(
                                (ingredient, index) => `
                                <div class="flex flex-col items-center justify-center p-4 rounded-lg bg-black group cursor-pointer ingredient"
                                    data-aos="fade-up"
                                    data-aos-delay="${index * 50}"
                                    data-ingredient="${ingredient.strIngredient}">
                                    <div class="mb-1">
                                        <img src="https://www.themealdb.com/images/ingredients/${ingredient.strIngredient}.png" 
                                            alt="${ingredient.strIngredient}" 
                                            class="w-24 h-24 object-contain transition-transform duration-300 group-hover:scale-110"/>
                                    </div>
                                    <p class="text-white font-medium px-3 py-2 w-full text-center text-xl md:text-2xl transition-transform duration-300 group-hover:scale-110">
                                        ${ingredient.strIngredient}
                                    </p>
                                </div>
                            `
                            )
                            .join("");

                        let paginationHTML = `
                            <div class="flex justify-center items-center gap-2 mt-6" data-aos="fade-up" data-aos-delay="200">
                                <button id="prev-page" class="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm md:text-base hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed" ${
                                    currentIngredientPage === 1 ? "disabled" : ""
                                }>
                                    Previous
                                </button>
                        `;

                        if (currentIngredientPage > 1) {
                            paginationHTML += `
                                <button class="page-btn bg-gray-700 text-white px-3 py-2 rounded-lg font-bold text-sm md:text-base hover:scale-105 transition-transform" data-page="${
                                    currentIngredientPage - 1
                                }">
                                    ${currentIngredientPage - 1}
                                </button>
                            `;
                        }

                        paginationHTML += `
                            <button class="page-btn bg-amber-600 text-white px-3 py-2 rounded-lg font-bold text-sm md:text-base hover:scale-105 transition-transform" data-page="${currentIngredientPage}">
                                ${currentIngredientPage}
                            </button>
                        `;

                        if (currentIngredientPage < totalPages) {
                            paginationHTML += `
                                <button class="page-btn bg-gray-700 text-white px-3 py-2 rounded-lg font-bold text-sm md:text-base hover:scale-105 transition-transform" data-page="${
                                    currentIngredientPage + 1
                                }">
                                    ${currentIngredientPage + 1}
                                </button>
                            `;
                        }

                        paginationHTML += `
                                <button id="next-page" class="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm md:text-base hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed" ${
                                    currentIngredientPage === totalPages ? "disabled" : ""
                                }>
                                    Next
                                </button>
                            </div>
                        `;

                        $("#content").html(
                            `<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" id="meals">${ingredientsHTML}</div>${paginationHTML}`
                        );

                        $(".ingredient").on("click", function () {
                            currentPage = "filterI";
                            const ingredient = $(this).attr("data-ingredient");
                            renderData(apiUrl.FilterI, "", ingredient);
                        });

                        $("#prev-page").on("click", function () {
                            if (currentIngredientPage > 1) {
                                currentIngredientPage--;
                                renderIngredients(currentIngredientPage);
                            }
                        });

                        $("#next-page").on("click", function () {
                            if (currentIngredientPage < totalPages) {
                                currentIngredientPage++;
                                renderIngredients(currentIngredientPage);
                            }
                        });

                        $(".page-btn").on("click", function () {
                            const page = parseInt($(this).attr("data-page"));
                            if (page !== currentIngredientPage) {
                                currentIngredientPage = page;
                                renderIngredients(currentIngredientPage);
                            }
                        });
                    }

                    renderIngredients(currentIngredientPage);

                    hideLoading();
                })
                .catch((error) => {
                    console.error("Ingredients error:", error);
                    $("#content").html(
                        '<p class="text-red-500">Error loading results</p>'
                    );
                    hideLoading();
                });
        }

        if (currentPage === "filterI") {
            showLoading();
            fetchData(apiUrl.FilterI, Search)
                .then((data) => {
                    const mealsHTML = data.meals
                        .map(
                            (meal, index) => `
                            <div class="overflow-hidden relative cursor-pointer meal rounded-2xl shadow-lg transition-all duration-300 group"
                                data-aos="fade-up"
                                data-aos-delay="${index * 100}"
                                data-mealID="${meal.idMeal}">
                                
                                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" 
                                    class="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"/>
                                
                                <div class="absolute inset-0 bg-[rgba(255,255,255,0.5)] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <h1 class="text-3xl text-black font-bold px-4 text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                                        ${meal.strMeal}
                                    </h1>
                                </div>
                            </div>
                        `
                        )
                        .join("");

                    $("#content").html(
                        `<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" id="meals">${mealsHTML}</div>`
                    );

                    $(".meal").on("click", function () {
                        currentPage = "meal";
                        const mealID = $(this).attr("data-mealID");
                        renderData(apiUrl.mealID, "", mealID);
                    });

                    hideLoading();
                })
                .catch((error) => {
                    console.error("Filter by Ingredient error:", error);
                    $("#content").html(
                        '<p class="text-red-500">Error loading results</p>'
                    );
                    hideLoading();
                });
        }

        if (currentPage === "contact us") {
            showLoading();
            
            $("#content").html(`
                <div class="flex justify-center items-center min-h-screen p-4">
                    <div class="bg-black rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-lg" data-aos="fade-up" data-aos-duration="600">
                        <h2 class="text-3xl md:text-4xl font-bold text-white text-center mb-6 italic" data-aos="fade-down" data-aos-delay="100">
                            Contact Us
                        </h2>
                        <div class="space-y-4">
                            <div class="relative">
                                <input type="text" id="fullName" placeholder="Full Name" 
                                    class="w-full border border-white rounded-lg px-4 py-3 text-white placeholder-white text-lg focus:outline-none focus:border-amber-600"
                                    data-aos="fade-up" data-aos-delay="200">
                                <p class="error text-red-500 text-sm mt-1 hidden">Please enter a valid full name (e.g., John Doe)</p>
                            </div>
                            <div class="relative">
                                <input type="email" id="email" placeholder="Email" 
                                    class="w-full border border-white rounded-lg px-4 py-3 text-white placeholder-white text-lg focus:outline-none focus:border-amber-600"
                                    data-aos="fade-up" data-aos-delay="300">
                                <p class="error text-red-500 text-sm mt-1 hidden">Please enter a valid email address</p>
                            </div>
                            <div class="relative">
                                <input type="tel" id="phone" placeholder="Phone Number" 
                                    class="w-full border border-white rounded-lg px-4 py-3 text-white placeholder-white text-lg focus:outline-none focus:border-amber-600"
                                    data-aos="fade-up" data-aos-delay="400">
                                <p class="error text-red-500 text-sm mt-1 hidden">Please enter a valid phone number (e.g., +1234567890)</p>
                            </div>
                            <div class="relative">
                                <input type="number" id="age" placeholder="Age" 
                                    class="w-full border border-white rounded-lg px-4 py-3 text-white placeholder-white text-lg focus:outline-none focus:border-amber-600"
                                    data-aos="fade-up" data-aos-delay="500">
                                <p class="error text-red-500 text-sm mt-1 hidden">Please enter an age between 13 and 120</p>
                            </div>
                            <div class="relative">
                                <input type="password" id="password" placeholder="Password" 
                                    class="w-full border border-white rounded-lg px-4 py-3 text-white placeholder-white text-lg focus:outline-none focus:border-amber-600"
                                    data-aos="fade-up" data-aos-delay="600">
                                <p class="error text-red-500 text-sm mt-1 hidden">Password must be 8+ characters with uppercase, lowercase, digit, and special character</p>
                            </div>
                            <div class="relative">
                                <input type="password" id="repassword" placeholder="Re-enter Password" 
                                    class="w-full border border-white rounded-lg px-4 py-3 text-white placeholder-white text-lg focus:outline-none focus:border-amber-600"
                                    data-aos="fade-up" data-aos-delay="700">
                                <p class="error text-red-500 text-sm mt-1 hidden">Passwords do not match</p>
                            </div>
                            <button id="sendBtn" class="cursor-pointer w-full bg-amber-600 text-white py-3 rounded-lg font-bold text-lg hover:scale-105 transition-transform disabled:opacity-10 disabled:cursor-not-allowed"
                                disabled data-aos="zoom-in" data-aos-delay="800">
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            `);

            const regex = {
                fullName: /^[A-Za-z\s-]{2,}\s+[A-Za-z\s-]{2,}$/,
                email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                phone: /^\+?[\d\s-]{7,15}$/,
                age: /^(1[3-9]|[2-9]\d|1[0-1]\d|120)$/,
                password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
            };

            const touched = {
                fullName: false,
                email: false,
                phone: false,
                age: false,
                password: false,
                repassword: false
            };

            function validateInput(inputId, value) {
                let isValid = true;
                let errorMessage = "";

                switch (inputId) {
                    case "fullName":
                        isValid = regex.fullName.test(value.trim());
                        errorMessage = "Please enter a valid full name (e.g., John Doe)";
                        break;
                    case "email":
                        isValid = regex.email.test(value.trim());
                        errorMessage = "Please enter a valid email address";
                        break;
                    case "phone":
                        isValid = regex.phone.test(value.trim());
                        errorMessage = "Please enter a valid phone number (e.g., +1234567890)";
                        break;
                    case "age":
                        isValid = regex.age.test(value.trim());
                        errorMessage = "Please enter an age between 13 and 120";
                        break;
                    case "password":
                        isValid = regex.password.test(value);
                        errorMessage = "Password must be 8+ characters with uppercase, lowercase, digit, and special character";
                        break;
                    case "repassword":
                        isValid = value === $("#password").val() && value !== "";
                        errorMessage = "Passwords do not match";
                        break;
                }

                if (touched[inputId]) {
                    $(`#${inputId}`).next(".error").toggleClass("hidden", isValid).text(errorMessage);
                }

                return isValid;
            }

            function validateForm() {
                const fullName = $("#fullName").val().trim();
                const email = $("#email").val().trim();
                const phone = $("#phone").val().trim();
                const age = $("#age").val().trim();
                const password = $("#password").val();
                const repassword = $("#repassword").val();

                const isFullNameValid = regex.fullName.test(fullName);
                const isEmailValid = regex.email.test(email);
                const isPhoneValid = regex.phone.test(phone);
                const isAgeValid = regex.age.test(age);
                const isPasswordValid = regex.password.test(password);
                const isRePasswordValid = password === repassword && password !== "";

                const isFormValid = isFullNameValid && isEmailValid && isPhoneValid && isAgeValid && isPasswordValid && isRePasswordValid;
                $("#sendBtn").prop("disabled", !isFormValid);
            }

            $("#fullName, #email, #phone, #age, #password, #repassword").on("input", function() {
                const inputId = $(this).attr("id");
                const value = $(this).val();

                touched[inputId] = true;

                validateInput(inputId, value);

                if (inputId === "password") {
                    validateInput("repassword", $("#repassword").val());
                }

                validateForm();
            });

            $("#sendBtn").on("click", function() {
                if (!$(this).prop("disabled")) {
                    alert("Thank you for your message! We'll get back to you soon.");
                    $("#fullName, #email, #phone, #age, #password, #repassword").val("");
                    $("#sendBtn").prop("disabled", true);
                    $(".error").addClass("hidden");
                    Object.keys(touched).forEach(key => touched[key] = false);
                }
            });

            hideLoading();
        }

    }

    renderData();
});