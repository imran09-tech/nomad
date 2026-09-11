/**
 * ============================================================================
 * ANTI-GRAVITY PHYSICS & PARTICLE SIMULATION ENGINE
 * ============================================================================
 * High-performance, modular physics engine designed for 60+ FPS anti-gravity 
 * particle dynamics, vector force fields, and interactive pointer repulsion.
 *
 * Core Physics Formulas:
 * 1. Anti-Gravity Lift (Negative Acceleration):
 *    F_lift = m * -g_anti
 * 2. Pointer Anti-Gravity Repulsion Field (Inverse-Square Law with Softening):
 *    F_repel = (K_repel * m_1 * m_2) / (r^2 + epsilon^2) * r_hat
 * 3. Viscous Drag / Aerodynamic Damping:
 *    F_drag = -c_drag * v
 * 4. Numerical Motion Integration (Semi-Implicit Euler):
 *    v(t + dt) = v(t) + (sum(F) / m) * dt
 *    x(t + dt) = x(t) + v(t + dt) * dt
 * ============================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.AntiGravityEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    /**
     * High-performance 2D Vector operations with zero per-frame allocation.
     */
    class Vector2D {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        set(x, y) {
            this.x = x;
            this.y = y;
            return this;
        }

        add(v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        }

        sub(v) {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        }

        scale(scalar) {
            this.x *= scalar;
            this.y *= scalar;
            return this;
        }

        magSq() {
            return this.x * this.x + this.y * this.y;
        }

        mag() {
            return Math.sqrt(this.magSq());
        }

        normalize() {
            const m = this.mag();
            if (m > 0.00001) {
                this.x /= m;
                this.y /= m;
            }
            return this;
        }

        distSq(v) {
            const dx = this.x - v.x;
            const dy = this.y - v.y;
            return dx * dx + dy * dy;
        }
    }

    /**
     * Default physics configuration parameters.
     */
    const DEFAULT_CONFIG = {
        particleCount: 75,
        antiGravityForce: 0.08,      // Upward buoyant acceleration
        repulsionRadius: 180,        // Radius of interactive repulsion field (px)
        repulsionStrength: 450,      // Repulsive force coefficient
        dragCoefficient: 0.985,      // Fluid damping factor per frame
        driftWander: 0.35,           // Perlin-style sinusoidal horizontal drift
        softeningFactor: 400,        // Epsilon squared for gravitational softening (prevents infinity)
        maxVelocity: 8.0,            // Velocity cap to maintain numerical stability
        enablePointerInteraction: true
    };

    /**
     * Offscreen Sprite Cache for zero-GC radial gradient rendering.
     */
    const SpriteCache = {
        goldStar: null,
        emeraldAurora: null,
        celestialSpore: null,
        isInitialized: false,
        currentTheme: 'gold',

        themes: {
            gold: {
                starFill: '#fce055', starGlow: '#d4af37',
                auroraInner: 'rgba(52, 211, 153, 0.9)', auroraOuter: 'rgba(16, 185, 129, 0)',
                sporeInner: 'rgba(212, 175, 55, 1)', sporeOuter: 'rgba(212, 175, 55, 0)'
            },
            cyberpunk: {
                starFill: '#00ffff', starGlow: '#00f0ff',
                auroraInner: 'rgba(255, 0, 127, 0.9)', auroraOuter: 'rgba(255, 0, 127, 0)',
                sporeInner: 'rgba(168, 85, 247, 1)', sporeOuter: 'rgba(168, 85, 247, 0)'
            },
            sapphire: {
                starFill: '#e2e8f0', starGlow: '#38bdf8',
                auroraInner: 'rgba(59, 130, 246, 0.9)', auroraOuter: 'rgba(37, 99, 235, 0)',
                sporeInner: 'rgba(56, 189, 248, 1)', sporeOuter: 'rgba(56, 189, 248, 0)'
            },
            emerald: {
                starFill: '#a7f3d0', starGlow: '#34d399',
                auroraInner: 'rgba(16, 185, 129, 0.9)', auroraOuter: 'rgba(5, 150, 105, 0)',
                sporeInner: 'rgba(52, 211, 153, 1)', sporeOuter: 'rgba(52, 211, 153, 0)'
            },
            rosegold: {
                starFill: '#fde68a', starGlow: '#fbbf24',
                auroraInner: 'rgba(244, 63, 94, 0.9)', auroraOuter: 'rgba(225, 29, 72, 0)',
                sporeInner: 'rgba(251, 191, 36, 1)', sporeOuter: 'rgba(251, 191, 36, 0)'
            }
        },

        init(themeName) {
            if (themeName) this.currentTheme = themeName;
            const palette = this.themes[this.currentTheme] || this.themes.gold;
            this.goldStar = this.createStarSprite(16, palette.starFill, palette.starGlow);
            this.emeraldAurora = this.createGlowSprite(24, palette.auroraInner, palette.auroraOuter);
            this.celestialSpore = this.createGlowSprite(18, palette.sporeInner, palette.sporeOuter);
            this.isInitialized = true;
        },

        setTheme(themeName) {
            this.currentTheme = themeName;
            this.init(themeName);
        },

        createGlowSprite(radius, innerColor, outerColor) {
            const canvas = document.createElement('canvas');
            const size = radius * 2;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            const grad = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
            grad.addColorStop(0, innerColor);
            grad.addColorStop(1, outerColor);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(radius, radius, radius, 0, Math.PI * 2);
            ctx.fill();
            return canvas;
        },

        createStarSprite(size, fillColor, glowColor) {
            const canvas = document.createElement('canvas');
            const dim = size * 2;
            canvas.width = dim;
            canvas.height = dim;
            const ctx = canvas.getContext('2d');
            const center = size;
            const radius = size * 0.7;

            ctx.fillStyle = fillColor;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const outerAngle = (18 + i * 72) * Math.PI / 180;
                const innerAngle = (54 + i * 72) * Math.PI / 180;
                ctx.lineTo(center + Math.cos(outerAngle) * radius, center - Math.sin(outerAngle) * radius);
                ctx.lineTo(center + Math.cos(innerAngle) * (radius * 0.45), center - Math.sin(innerAngle) * (radius * 0.45));
            }
            ctx.closePath();
            ctx.fill();
            return canvas;
        }
    };

    /**
     * Anti-Gravity Particle entity backed by vector kinematics.
     */
    class Particle {
        constructor() {
            this.pos = new Vector2D();
            this.vel = new Vector2D();
            this.acc = new Vector2D();
            this.size = 1;
            this.mass = 1;
            this.opacity = 1;
            this.rotation = 0;
            this.rotSpeed = 0;
            this.type = 0;
            this.phaseOffset = Math.random() * Math.PI * 2;
        }

        reset(width, height, isInitial = false) {
            this.pos.set(
                Math.random() * width,
                isInitial ? Math.random() * height : height + 20 + Math.random() * 30
            );
            this.vel.set(
                (Math.random() - 0.5) * 0.8,
                -(Math.random() * 1.5 + 0.6)
            );
            this.acc.set(0, 0);

            this.size = Math.random() * 5 + 2;
            this.mass = this.size * 0.5;
            this.opacity = Math.random() * 0.65 + 0.35;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.03;

            // 0: Gold Star, 1: Emerald Glow, 2: Celestial Spore
            const rand = Math.random();
            this.type = rand < 0.4 ? 0 : (rand < 0.75 ? 1 : 2);
        }

        applyForce(force) {
            // F = m * a  =>  a = F / m
            this.acc.x += force.x / this.mass;
            this.acc.y += force.y / this.mass;
        }

        update(config, width, height, pointerPos) {
            // 1. Constant Anti-Gravity Buoyancy Force
            this.acc.y -= config.antiGravityForce;

            // 2. Sinusoidal Atmospheric Wander Force
            const wave = Math.sin(this.pos.y * 0.01 + this.phaseOffset) * config.driftWander;
            this.acc.x += wave;

            // 3. Pointer Anti-Gravity Repulsion Force Field
            if (config.enablePointerInteraction && pointerPos.x >= 0 && pointerPos.y >= 0) {
                const dx = this.pos.x - pointerPos.x;
                const dy = this.pos.y - pointerPos.y;
                const distSq = dx * dx + dy * dy;
                const radiusSq = config.repulsionRadius * config.repulsionRadius;

                if (distSq < radiusSq && distSq > 0.01) {
                    // Inverse-Square Force with Softening: F = K / (r^2 + eps^2)
                    const forceMag = config.repulsionStrength / (distSq + config.softeningFactor);
                    const dist = Math.sqrt(distSq);
                    
                    this.acc.x += (dx / dist) * forceMag;
                    this.acc.y += (dy / dist) * forceMag;
                }
            }

            // 4. Semi-Implicit Euler Integration
            this.vel.add(this.acc);
            
            // 5. Viscous Drag / Aerodynamic Damping
            this.vel.scale(config.dragCoefficient);

            // 6. Velocity Clamp
            const currentSpeedSq = this.vel.magSq();
            if (currentSpeedSq > config.maxVelocity * config.maxVelocity) {
                this.vel.normalize().scale(config.maxVelocity);
            }

            // 7. Update Position
            this.pos.add(this.vel);
            this.rotation += this.rotSpeed;

            // Reset acceleration accumulator
            this.acc.set(0, 0);

            // 8. Boundary recycling
            if (this.pos.y < -40 || this.pos.x < -40 || this.pos.x > width + 40) {
                this.reset(width, height, false);
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;

            if (this.type === 0 && SpriteCache.goldStar) {
                ctx.translate(this.pos.x, this.pos.y);
                ctx.rotate(this.rotation);
                const drawDim = this.size * 2;
                ctx.drawImage(SpriteCache.goldStar, -drawDim / 2, -drawDim / 2, drawDim, drawDim);
            } else if (this.type === 1 && SpriteCache.emeraldAurora) {
                const drawDim = this.size * 3.5;
                ctx.drawImage(SpriteCache.emeraldAurora, this.pos.x - drawDim / 2, this.pos.y - drawDim / 2, drawDim, drawDim);
            } else if (SpriteCache.celestialSpore) {
                const drawDim = this.size * 2.8;
                ctx.drawImage(SpriteCache.celestialSpore, this.pos.x - drawDim / 2, this.pos.y - drawDim / 2, drawDim, drawDim);
            }

            ctx.restore();
        }
    }

    /**
     * Anti-Gravity Simulation Engine Controller
     */
    class Engine {
        constructor(canvas, customConfig = {}) {
            if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
                throw new Error('[AntiGravityEngine] Valid HTMLCanvasElement required.');
            }

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.config = Object.assign({}, DEFAULT_CONFIG, customConfig);

            this.width = 0;
            this.height = 0;
            this.dpr = 1;

            this.particles = [];
            this.pointerPos = new Vector2D(-1000, -1000);
            this.animId = null;
            this.isRunning = false;

            // Event handler bindings for clean cleanup
            this._handleResize = this.resize.bind(this);
            this._handlePointerMove = this.onPointerMove.bind(this);
            this._handlePointerLeave = this.onPointerLeave.bind(this);
            this._handleVisibility = this.onVisibilityChange.bind(this);
            this._loop = this.loop.bind(this);

            SpriteCache.init();
            this.init();
        }

        init() {
            this.resize();
            this.createObjectPool();

            // Register event listeners
            window.addEventListener('resize', this._handleResize);
            window.addEventListener('mousemove', this._handlePointerMove, { passive: true });
            window.addEventListener('mouseleave', this._handlePointerLeave, { passive: true });
            window.addEventListener('touchmove', this._handlePointerMove, { passive: true });
            document.addEventListener('visibilitychange', this._handleVisibility);
        }

        createObjectPool() {
            this.particles = [];
            for (let i = 0; i < this.config.particleCount; i++) {
                const p = new Particle();
                p.reset(this.width, this.height, true);
                this.particles.push(p);
            }
        }

        resize() {
            this.dpr = window.devicePixelRatio || 1;
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;

            this.ctx.resetTransform();
            this.ctx.scale(this.dpr, this.dpr);
        }

        onPointerMove(e) {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            this.pointerPos.set(clientX, clientY);
        }

        onPointerLeave() {
            this.pointerPos.set(-1000, -1000);
        }

        onVisibilityChange() {
            if (document.hidden) {
                this.pause();
            } else {
                this.start();
            }
        }

        loop() {
            if (!this.isRunning) return;

            this.ctx.clearRect(0, 0, this.width, this.height);

            const len = this.particles.length;
            for (let i = 0; i < len; i++) {
                const p = this.particles[i];
                p.update(this.config, this.width, this.height, this.pointerPos);
                p.draw(this.ctx);
            }

            this.animId = requestAnimationFrame(this._loop);
        }

        start() {
            if (!this.isRunning) {
                this.isRunning = true;
                this._loop();
            }
        }

        pause() {
            if (this.isRunning) {
                this.isRunning = false;
                if (this.animId) {
                    cancelAnimationFrame(this.animId);
                    this.animId = null;
                }
            }
        }

        destroy() {
            this.pause();
            window.removeEventListener('resize', this._handleResize);
            window.removeEventListener('mousemove', this._handlePointerMove);
            window.removeEventListener('mouseleave', this._handlePointerLeave);
            window.removeEventListener('touchmove', this._handlePointerMove);
            document.removeEventListener('visibilitychange', this._handleVisibility);
            this.particles = [];
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }

    return {
        Vector2D,
        Engine,
        DEFAULT_CONFIG,
        setTheme: (themeName) => SpriteCache.setTheme(themeName),
        create: (canvas, config) => new Engine(canvas, config)
    };
}));
