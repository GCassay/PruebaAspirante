var rolRecolector = {
    // Recoger energía para el Spawn (si tiene capacidad)
    run: function(creep) {
            
            if(creep.memory.transferir && creep.carry.energy == 0) { // Creep en Modo Transferir / Sin energía
                creep.memory.transferir = false; // Pasar a Modo Recolección para obtener más energía
                //creep.say('Recolectar');
            }
            if(!creep.memory.transferir && creep.carry.energy == creep.carryCapacity) { // Creep en Modo Recolección / Full energía
                creep.memory.transferir = true; // Pasar a Modo Transferir para llevar energía a un contenedor
                //creep.say('Transferir');
            }
            if(creep.memory.transferir) { // Creep en Modo Transferir / Con energía

    			// Entregará la energía al Controlador si está en el rango
    			if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
    				// Si no es así, se desplazará primero hasta él
    				creep.moveTo(creep.room.controller);
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

module.exports = rolRecolector;
