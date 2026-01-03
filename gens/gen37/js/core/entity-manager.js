/**
 * Entity Manager - Manages all game entities
 */

const EntityManager = (function() {
    'use strict';
    
    // Entity collections
    const entities = new Map();
    const celestialBodies = [];
    const interactiveObjects = [];
    
    // Special references
    let sun = null;
    let planets = [];
    let moons = [];
    let player = null;
    
    return {
        /**
         * Initialize entity manager
         */
        init: function() {
            entities.clear();
            celestialBodies.length = 0;
            interactiveObjects.length = 0;
            planets.length = 0;
            moons.length = 0;
            sun = null;
            player = null;
            
            Logger.info('EntityManager', 'Entity manager initialized');
        },
        
        /**
         * Register an entity
         */
        register: function(entity) {
            entities.set(entity.id, entity);
            
            // Categorize
            if (entity instanceof Sun) {
                sun = entity;
                celestialBodies.push(entity);
            } else if (entity instanceof Planet) {
                planets.push(entity);
                celestialBodies.push(entity);
            } else if (entity instanceof Moon) {
                moons.push(entity);
                celestialBodies.push(entity);
            } else if (entity instanceof InteractiveObject) {
                interactiveObjects.push(entity);
            } else if (entity instanceof PlayerController) {
                player = entity;
            }
        },
        
        /**
         * Unregister an entity
         */
        unregister: function(entity) {
            entities.delete(entity.id);
            
            // Remove from categories
            const removeFrom = (arr, item) => {
                const idx = arr.indexOf(item);
                if (idx !== -1) arr.splice(idx, 1);
            };
            
            removeFrom(celestialBodies, entity);
            removeFrom(planets, entity);
            removeFrom(moons, entity);
            removeFrom(interactiveObjects, entity);
            
            if (entity === sun) sun = null;
            if (entity === player) player = null;
        },
        
        /**
         * Update all entities
         */
        update: function(deltaTime, camera) {
            // Update sun
            if (sun) {
                sun.update(deltaTime, camera);
            }
            
            // Update planets
            for (const planet of planets) {
                planet.update(deltaTime);
            }
            
            // Update moons
            for (const moon of moons) {
                moon.update(deltaTime);
            }
            
            // Update interactive objects
            for (const obj of interactiveObjects) {
                obj.update(deltaTime);
            }
        },
        
        /**
         * Get entity by ID
         */
        getById: function(id) {
            return entities.get(id);
        },
        
        /**
         * Get all entities
         */
        getAll: function() {
            return Array.from(entities.values());
        },
        
        /**
         * Get sun
         */
        getSun: function() {
            return sun;
        },
        
        /**
         * Get planets
         */
        getPlanets: function() {
            return planets;
        },
        
        /**
         * Get planet by name
         */
        getPlanetByName: function(name) {
            return planets.find(p => p.name === name);
        },
        
        /**
         * Get moons
         */
        getMoons: function() {
            return moons;
        },
        
        /**
         * Get celestial bodies
         */
        getCelestialBodies: function() {
            return celestialBodies;
        },
        
        /**
         * Get interactive objects
         */
        getInteractiveObjects: function() {
            return interactiveObjects;
        },
        
        /**
         * Get player
         */
        getPlayer: function() {
            return player;
        },
        
        /**
         * Clean up all entities
         */
        cleanup: function() {
            for (const entity of entities.values()) {
                entity.destroy();
            }
            this.init();
        }
    };
})();

window.EntityManager = EntityManager;
