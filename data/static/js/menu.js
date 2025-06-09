/**
 * Class 
 */
class Menu {
    /** implementation of dynamic page content construction */
    static buildPageContent(data, parentNode, deep = 1) {

        /** Click handler for content */
        document.getElementById('pageContent').addEventListener('click', (e) => {
            let link = e.target.closest('a');
            if (link && link.closest('div[class^="level"]')) {
                e.preventDefault();
                let targetId = link.getAttribute('href').substring(1);
                let targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
                localStorage.setItem('lastSectId', targetId);
            }
        });

        /** Inserting an arrow for the content */
        function addArrowToDiv(div) {
            if (div.querySelector('.arrow')) return;
            const arrowHTML = `
                <svg viewBox="0 0 16 16" width="16" height="16" class="arrow">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.9417 5.5L8 8.54753L11.0583 5.5L12.5 6.93662L8.72085 10.7025C8.32273 11.0992 7.67726 11.0992 7.27915 10.7025L3.5 6.93662L4.9417 5.5Z" fill="#A6B5C7"/>
                </svg>`;
            let container = div.querySelector('div:first-child') || div;
            container.insertAdjacentHTML('beforeend', arrowHTML);
            let arrow = container.querySelector('.arrow');
            /** Click on the entire block */
            container.addEventListener('click', () => {
                let nestedDiv = div.querySelector('.nested-sections');
                if (nestedDiv) {
                    nestedDiv.classList.toggle('hidden');
                    if (arrow) {
                        /** Turn the arrow */
                        arrow.classList.toggle('up');
                    }
                }
            });
        }

        /** Creating hierarchical content */
        data.sections.forEach(section => {
            let hasTableCap = ('toc_cap' in section);
            let hasNestedSections = ('sections' in section);
            let div = document.createElement('div');
            div.classList.add(`level${deep}`);

            if (hasTableCap) {
                let container = document.createElement('div');
                container.style.display = 'flex';
                container.style.alignItems = 'center';

                let a = document.createElement('a');
                a.innerHTML = section.toc_cap;
                a.href = `#${section.sect_id}`;
                a.classList.add('anchor');
                a.setAttribute('id', `menu_${section.sect_id}`);
                container.appendChild(a);
                div.appendChild(container);
            }

            if (hasNestedSections) {
                let nestedDiv = document.createElement('div');
                nestedDiv.className = 'nested-sections hidden';
                this.buildPageContent(section, nestedDiv, deep + 1);

                // TODO: Переписать код ниже на красивую рекурсию взамен двух вложенных циклов
                if (deep === 1) {
                    let level2Divs = nestedDiv.querySelectorAll('div.level2');
                    if (level2Divs.length) {
                        addArrowToDiv(div);
                    }
                    level2Divs.forEach(level2 => {
                        let level3Divs = level2.querySelectorAll('div.level3');
                        if (level3Divs.length) {
                            addArrowToDiv(level2);
                        }
                    });
                }

                div.appendChild(nestedDiv);
            }

            parentNode.appendChild(div);
        });

        /** Adding the "chapter" class to links */
        let allLinks = parentNode.querySelectorAll('div[class^="level"] a');
        allLinks.forEach(link => {
            let parentDiv = link.closest('div');
            if (parentDiv) {
                parentDiv.classList.add('chapter');
            }
        });
        return parentNode;
    }

    /** Create a logo */
    static drawLogo() {
        let reportContent = document.getElementById('pageContent');

        let logo = document.createElement('img');
        logo.setAttribute('id', 'logo');
        logo.setAttribute('src', 'data/static/js/logo.svg')

        let logoMini = document.createElement('img');
        logoMini.setAttribute('id', 'logoMini');
        logoMini.setAttribute('src', 'data/static/js/logo_mini.svg')
        logoMini.setAttribute('class', 'hidden');
        
        reportContent.insertAdjacentElement('afterbegin', logo);
        reportContent.insertAdjacentElement('afterbegin', logoMini);
    }

    static buildMenu() {
        let body = document.querySelector('body');

        /** Page Content */
        let pageContent = `
            <div id="pageContent">
                <div id="sections" class="active"></div>
            </div>
        `
        body.insertAdjacentHTML('afterbegin', pageContent);
        let sections = document.getElementById("sections");
        Menu.buildPageContent(data, sections, 1);

        /** Draw Logo */
        this.drawLogo();

        /** Draw Search */
        this.createSearchAndDropdown();
    }

    /** Creating an input and selection field */
    static createSearchAndDropdown() {
        const body = document.querySelector('body');
        let container = document.createElement('div');
        container.id = 'searchDropdownContainer';
    /** A block is being created for the search field and its buttons*/
        let searchWrapper = document.createElement('div');
        searchWrapper.id = 'searchWrap';
        searchWrapper.style.display = 'flex';
        /** Creating a search field */
        let input = document.createElement('input');
        input.type = 'text';
        input.id = 'searchField';
        input.placeholder = 'Search';
        /** Creating a search button */
        let searchButton = document.createElement('button');
        searchButton.type = 'button';
        searchButton.id = 'searchButton';

    /** Inserting SVG into the search field */
        searchButton.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_371_5886)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12ZM14 12.5858L15.7071 14.2929L14.2929 15.7071L12.5858 14L14 12.5858ZM6.24974 6.33882C6.43444 6.12956 6.70147 6 7 6V4C6.10384 4 5.2985 4.3942 4.75026 5.01535L6.24974 6.33882Z" fill="#14B0FF"/>
        </g>
        <defs>
            <clipPath id="clip0_371_5886">
                <rect width="16" height="16" fill="white"/>
            </clipPath>
        </defs>
    </svg>`;
        searchWrapper.appendChild(input);
        searchWrapper.appendChild(searchButton);

    /** Creating a field with a drop-down list */
        let select = document.createElement('select');
        select.id = 'dropdownSelect';

    /** Adding options */
        let defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Choice';
        select.appendChild(defaultOption);

        ['1', '2'].forEach((text, index) => {
            let option = document.createElement('option');
            option.value = `option${index + 1}`;
            option.textContent = text;
            select.appendChild(option);
        });
        
    /** Insert the svg arrow into the drop-down list box */
        const arrowBlue = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.9417 5.5L8 8.54753L11.0583 5.5L12.5 6.93662L8.72085 10.7025C8.32273 11.0992 7.67726 11.0992 7.27915 10.7025L3.5 6.93662L4.9417 5.5Z" fill="#14B0FF"/>
            </svg>`;

        let DropDownArrow  = encodeURIComponent(arrowBlue);
        select.style.backgroundImage = `url("data:image/svg+xml;utf8,${DropDownArrow }")`;

    /** Inserting the fields into the container */
        container.appendChild(searchWrapper);
        container.appendChild(select);

    /** We insert it after the logos */
        let logoContainer = document.getElementById('logo');
        if (logoContainer && logoContainer.parentNode) {
            logoContainer.parentNode.insertBefore(container, logoContainer.nextSibling);
        } else {
            document.body.insertBefore(container, document.body.firstChild);
        }
    }

    /** Track the scroll position and highlight the relevant sections in the menu */
    static navigateBorder() {
        document.addEventListener('scroll', () => {
            const width = document.getElementById('pageContent').offsetWidth + 30;
            const height = 0;
            const element = document.elementFromPoint(width, height);
            if (!element) return;

            /** Detecting section id */
            let sectId;
            let targetHeader = element.closest('h3, p, table');
            if (targetHeader) {
                if (targetHeader.tagName === 'H3') {
                    sectId = targetHeader.getAttribute('id');
                } else if (targetHeader.tagName === 'P') {
                    sectId = targetHeader.getAttribute('id');
                } else if (targetHeader.tagName === 'TABLE') {
                    sectId = targetHeader.parentNode.firstChild.getAttribute('id');
                }
            }
            if (!sectId) return;

            /** Removing the 'activeSection' from everyone */
            document.querySelectorAll('.chapter.activeSection').forEach(ch => ch.classList.remove('activeSection'));

            /** We are looking for a link that matches the id */
            let chapterBlock = document.querySelectorAll('.chapter a');
            for (let link of chapterBlock) {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) continue;
                const hrefId = href.substring(1);
                if (hrefId === sectId) {
                    let chapterDiv = link.closest('.chapter');
                    if (chapterDiv) {
                    chapterDiv.classList.add('activeSection');
                    break;
                    }
                }
            }
        });
    }

    /** Opening and closing menus on a page, and switching logos */
    static toggleMenu() {
    let menu = document.getElementById('pageContent');
    let logo = document.getElementById('logo');
    let logoMini = document.getElementById('logoMini');
    let container = document.getElementById('container');

    let searchDropdownContainer = document.getElementById('searchDropdownContainer');
    let initPageContentWidth = document.getElementById('pageContent').offsetWidth;
    /** Setting the initial position and width */
    container.style.left = `${initPageContentWidth}px`;
    menu.style.width = `${initPageContentWidth - 40}px`;
    let newOffsetWidth = 35;
    /** Expand the menu */
    [logo, logoMini].forEach(elem => 
        elem.addEventListener('click', function() {

            if (menu.classList.contains('hidden')) {
                /** Expand the menu */
                menu.style.width = `${initPageContentWidth - 40}px`;
                container.style.left = `${initPageContentWidth}px`;
                menu.classList.remove('hidden');

                logo.classList.remove('hidden');
                logoMini.classList.add('hidden');
                
                /* Show searchMenu on click on Logo */
                searchDropdownContainer.classList.remove('hidden');

            } else {
                /** Minimizing the menu */
                menu.style.width = `${newOffsetWidth}px`;
                container.style.left = `${newOffsetWidth + 40}px`;
                menu.classList.add('hidden');

                logo.classList.add('hidden');
                logoMini.classList.remove('hidden');
                
                /* Hide searchMenu on click on Logo */
                searchDropdownContainer.classList.add('hidden');
            }
        })
    )
    }

    static init() {
        this.buildMenu();
        this.navigateBorder();
        this.toggleMenu();
    }
}