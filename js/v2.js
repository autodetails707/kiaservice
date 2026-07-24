/* ==========================================================
   KIA SERVICE v2 — JS
========================================================== */

document.addEventListener('DOMContentLoaded', function () {

    /* --- Header background on scroll --- */
    var header = document.querySelector('header');
    function onScroll() {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', onScroll);
    onScroll();

    /* --- Mobile burger menu --- */
    var burger = document.querySelector('.burger');
    var menu = document.querySelector('nav ul');
    if (burger) {
        burger.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('open');
            });
        });
    }

    /* --- Scroll reveal animation --- */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        reveals.forEach(function (el) { io.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('show'); });
    }

    /* --- Animated counters --- */
    var counters = document.querySelectorAll('[data-count]');
    var counted = false;
    function runCounters() {
        if (counted) return;
        var statsSection = document.querySelector('.stats');
        if (!statsSection) return;
        var top = statsSection.getBoundingClientRect().top;
        if (top < window.innerHeight - 80) {
            counted = true;
            counters.forEach(function (el) {
                var target = parseInt(el.getAttribute('data-count'), 10);
                var suffix = el.getAttribute('data-suffix') || '';
                var current = 0;
                var step = Math.max(1, Math.ceil(target / 60));
                var timer = setInterval(function () {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = current + suffix;
                }, 24);
            });
        }
    }
    window.addEventListener('scroll', runCounters);
    runCounters();

    /* --- Current year in footer --- */
    var y = document.getElementById('year');
    if (y) { y.textContent = new Date().getFullYear(); }

});
