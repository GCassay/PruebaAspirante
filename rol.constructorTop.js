var rolConstructorTop = { // Tarea: Construir Road

    run: function(creep) {

        if(creep.memory.construir && creep.carry.energy == 0) { // Creep en Modo Construcción / Sin energía
            creep.memory.construir = false; // Pasar a Modo Recolección para obtener más energía
            creep.say('Recolectar');
        }
        if(!creep.memory.construir && creep.carry.energy == creep.carryCapacity) { // Creep en Modo Recolección / Full energía
            creep.memory.construir = true; // Pasar a Modo Construcción para comenzar a construir
            creep.say('Construir');
        }
        if(creep.memory.construir) { // Creep en Modo Construcción / Con energía
        
            // Constuir Vías
            var via = Game.spawns.Central.room.find(FIND_CONSTRUCTION_SITES, { filter: (f) => f.structureType==STRUCTURE_ROAD });
            
            if(via.length > 0) {
                if(creep.build(via[0]) == ERR_NOT_IN_RANGE){
                    creep.moveTo(via[0]);
                }
            }
            // Si las Vías ya fueron construídas, recolectar energía para transferir al Spawn
            else if(Game.spawns['Central'].energy < Game.spawns['Central'].energyCapacity) {
                
                if(creep.transfer(Game.spawns['Central'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns['Central']);
                }
            }
        }
            
        else { // Modo Recolección 
            var punto = Game.rooms.sim.getPositionAt(35,2);
            var fuente = punto.findClosestByRange(FIND_SOURCES_ACTIVE);
            // Si no está en el rango de la fuente, desplazarse hasta ella
            if(creep.harvest(fuente) == ERR_NOT_IN_RANGE) {
                creep.moveTo(fuente);
            }      
        }
    }
};

module.exports = rolConstructorTop;
