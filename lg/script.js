/**
 * Liquid Glass Effect - Class based implementation
 */

(function () {
    'use strict';

    // === Utility Functions ===
    function smoothStep(a, b, t) {
        t = Math.max(0, Math.min(1, (t - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    function generateId() {
        return 'lg-' + Math.random().toString(36).substr(2, 9);
    }

    // === Core Class ===
    class LiquidGlassElement {
        constructor(element) {
            this.element = element;
            this.id = generateId();
            this.canvasDPI = 1; // Performance optimization
            this.mouse = { x: 0.5, y: 0.5 };

            // Configuration for the distortion effect
            this.options = {
                // Returns the source coordinate to sample from for a given UV and mouse position
                fragment: (uv, mouse) => {
                    // Normalize coordinates (0..1) -> (-0.5..0.5)
                    const ix = uv.x - 0.5;
                    const iy = uv.y - 0.5;
                    const mx = mouse.x - 0.5;
                    const my = mouse.y - 0.5;

                    // Calculate distance from current pixel to mouse
                    const dist = Math.sqrt((ix - mx) ** 2 + (iy - my) ** 2);

                    // Create a "lens" or "ripple" effect falloff
                    // The effect is strongest near the mouse and fades out
                    const strength = smoothStep(0.4, 0.0, dist) * 0.1; // 0.10 is intensity

                    // Calculate direction from pixel to mouse
                    const dirX = ix - mx;
                    const dirY = iy - my;

                    // Return displaced coordinates
                    return {
                        x: uv.x - dirX * strength,
                        y: uv.y - dirY * strength
                    };
                }
            };

            this.init();
        }

        init() {
            const rect = this.element.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;

            if (this.width === 0 || this.height === 0) return;

            this.createSVGFilter();
            this.createCanvas();
            this.applyFilter();
            this.setupEvents();
            this.updateShader();
        }

        createSVGFilter() {
            this.svgContainer = document.createElement('div');
            this.svgContainer.style.cssText = `
                position: absolute; width: 0; height: 0; overflow: hidden; pointer-events: none; visibility: hidden;
            `;

            const svgNS = 'http://www.w3.org/2000/svg';
            this.svg = document.createElementNS(svgNS, 'svg');
            this.svg.setAttribute('width', this.width);
            this.svg.setAttribute('height', this.height);

            const defs = document.createElementNS(svgNS, 'defs');
            const filter = document.createElementNS(svgNS, 'filter');
            filter.setAttribute('id', `${this.id}_filter`);
            filter.setAttribute('filterUnits', 'userSpaceOnUse');
            filter.setAttribute('x', '0');
            filter.setAttribute('y', '0');
            filter.setAttribute('width', this.width);
            filter.setAttribute('height', this.height);

            this.feImage = document.createElementNS(svgNS, 'feImage');
            this.feImage.setAttribute('id', `${this.id}_map`);
            this.feImage.setAttribute('width', this.width);
            this.feImage.setAttribute('height', this.height);
            this.feImage.setAttribute('result', 'map');

            this.feDisplacementMap = document.createElementNS(svgNS, 'feDisplacementMap');
            this.feDisplacementMap.setAttribute('in', 'SourceGraphic');
            this.feDisplacementMap.setAttribute('in2', 'map');
            this.feDisplacementMap.setAttribute('scale', '20');
            this.feDisplacementMap.setAttribute('xChannelSelector', 'R');
            this.feDisplacementMap.setAttribute('yChannelSelector', 'G');

            filter.appendChild(this.feImage);
            filter.appendChild(this.feDisplacementMap);
            defs.appendChild(filter);
            this.svg.appendChild(defs);

            this.svgContainer.appendChild(this.svg);
            document.body.appendChild(this.svgContainer);
        }

        createCanvas() {
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.width * this.canvasDPI;
            this.canvas.height = this.height * this.canvasDPI;
            this.context = this.canvas.getContext('2d');
        }

        applyFilter() {
            const filterValue = `url(#${this.id}_filter) blur(10px) saturate(150%)`;
            this.element.style.backdropFilter = filterValue;
            this.element.style.webkitBackdropFilter = filterValue;
        }

        setupEvents() {
            this.element.addEventListener('mousemove', (e) => {
                const rect = this.element.getBoundingClientRect();
                this.mouse.x = (e.clientX - rect.left) / rect.width;
                this.mouse.y = (e.clientY - rect.top) / rect.height;
                requestAnimationFrame(() => this.updateShader());
            });

            this.element.addEventListener('mouseleave', () => {
                this.mouse.x = 0.5;
                this.mouse.y = 0.5;
                requestAnimationFrame(() => this.updateShader());
            });

            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const rect = entry.contentRect;
                    if (rect.width !== this.width || rect.height !== this.height) {
                        this.resize(rect.width, rect.height);
                    }
                }
            });
            resizeObserver.observe(this.element);
        }

        resize(w, h) {
            this.width = w;
            this.height = h;

            this.svg.setAttribute('width', w);
            this.svg.setAttribute('height', h);
            const filter = this.svg.querySelector('filter');
            filter.setAttribute('width', w);
            filter.setAttribute('height', h);
            this.feImage.setAttribute('width', w);
            this.feImage.setAttribute('height', h);

            this.canvas.width = w * this.canvasDPI;
            this.canvas.height = h * this.canvasDPI;

            this.updateShader();
        }

        updateShader() {
            const w = this.canvas.width;
            const h = this.canvas.height;
            if (w === 0 || h === 0) return;

            const imageData = this.context.createImageData(w, h);
            const data = imageData.data;

            const mouseProxy = { x: this.mouse.x, y: this.mouse.y };

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const index = (y * w + x) * 4;
                    const uv = { x: x / w, y: y / h };

                    const pos = this.options.fragment(uv, mouseProxy);

                    const dx = pos.x - uv.x;
                    const dy = pos.y - uv.y;

                    // Normalize displacement for map (127 is usually 0 displacement for some modes, 
                    // but for simplest R/G map we just need variations)
                    data[index] = 127 + dx * 1000;
                    data[index + 1] = 127 + dy * 1000;
                    data[index + 2] = 0;
                    data[index + 3] = 255;
                }
            }

            this.context.putImageData(imageData, 0, 0);
            this.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.canvas.toDataURL());
        }
    }

    // === Initialization ===
    function init() {
        // Find elements and init
        const elements = document.querySelectorAll('.lg');
        elements.forEach(el => new LiquidGlassElement(el));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
