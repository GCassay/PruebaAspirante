/**************************************************************************
* README
***************************************************************************
* 1. Coordenadas a asignar al Spawn inicial -> X:25 Y:25
* 2. Nombre asignado al Spawn -> Central
* 3. Activar 'Show flags' en DISPLAY OPTIONS
* 4. Los minutos totales de ejecución se muestran por consola al finalizar
* 5. Descomentar línea 86 para visualizar contador de ticks en consola
***************************************************************************
* El código genera en el juego:
* Construcción de 2 Structures Container
* Construcción de 1 Structure Road
* Transferencia de energía a Containers y Spawn
* Upgrade del Controller
***************************************************************************
* Autor: G. Cassinello
***************************************************************************/

// Cargar módulos
var rolRecolector = require('rol.recolector');          // Obtener energía para transferir a Controller y Spawn
var rolRecargadorBot = require('rol.recargadorBot');    // Obtener energía de la fuente inferior para transferir a estructuras
var rolRecargadorMid = require('rol.recargadorMid');    // Obtener energía de la fuente central para transferir a estructuras
var rolConstructorBot = require('rol.constructorBot');  // Obtener energía de la fuente inferior para construir Container inferior
var rolConstructorMid = require('rol.constructorMid');  // Obtener energía de la fuente central para construir Container central
var rolConstructorTop = require('rol.constructorTop');  // Obtener energía de la fuente superior para construir Road tiles

module.exports.loop = function () {

    if(Game.time == 1){ // Iniciar tiempo de prueba en tick 1
    
        console.log('INICIO DE LA PRUEBA');
        
        if(!Memory.datos){ // Se guarda el Epoch Time del instante en que se posiciona el primer Spawn
            Memory.datos = {
              epoch: String(Date.now()),
              controlador: false,   // Si el controlador es level 2
              contenedorX: 34,      // Coordenada x de Container 1
              contenedorY: 23,      // Coordenada y de Container 1
              contenedor2X: 41,     // Coordenada x de Container 2 
              contenedor2Y: 42      // Coordenada y de Container 2
            };
        }
        
        // Crear ConstructionSite para Containers y Roads
        Game.rooms.sim.createConstructionSite(parseInt(Memory.datos.contenedorX), parseInt(Memory.datos.contenedorY), STRUCTURE_CONTAINER); 
        Game.rooms.sim.createConstructionSite(parseInt(Memory.datos.contenedor2X), parseInt(Memory.datos.contenedor2Y), STRUCTURE_CONTAINER);
        Game.rooms.sim.createConstructionSite(31, 5, STRUCTURE_ROAD); 
        Game.rooms.sim.createConstructionSite(33, 2, STRUCTURE_ROAD); 
        Game.rooms.sim.createConstructionSite(34, 2, STRUCTURE_ROAD); 
        Game.rooms.sim.createConstructionSite(32, 3, STRUCTURE_ROAD); 
        Game.rooms.sim.createConstructionSite(33, 3, STRUCTURE_ROAD); 
        Game.rooms.sim.createConstructionSite(31, 4, STRUCTURE_ROAD); 
        Game.rooms.sim.createConstructionSite(32, 4, STRUCTURE_ROAD); 
    }
    
    // Fin de la prueba (tick 2000)
    if(Game.time == 2000){
        
        var final = parseInt(Date.now());           // Se obtiene el Epoch Time del instante en que se alcanzan los 2000 ticks
        var inicio = parseInt(Memory.datos.epoch);  // Se recoge el Epoch Time de inicio
        var tiempo = final - inicio;                // Se calculan los milisegundos transcurridos
        var tiempo = Math.floor(tiempo / 60000);    // Convertir milisegundos a minutos
        
        console.log('TIEMPO TRANSCURRIDO: '+ tiempo +' minutos');// Se usa como medida de tiempo el minuto
        
        // Se genera un elemento flag en el mapa indicando el final del contador
        Game.rooms.sim.createFlag(25, 25, 'Tiempo Finalizado', COLOR_WHITE); 
        
        // Limpiar el mapa de creeps
        for(var nombre in Game.creeps) {
            var minion = Game.creeps[nombre];
            minion.suicide();
        }
    }

   // Limpiar memoria de creeps eliminados o que ya finalizaron su ciclo de vida
   for(var nombre in Memory.creeps) {
        if(!Game.creeps[nombre]) {
            delete Memory.creeps[nombre];
        }
    }
    
    // Actividad entre ticks 1 y 1999
    if(Game.time > 0 && Game.time < 2000){
    
        //console.log(Game.time); // Contador de ticks
        
        // Filtros de Creeps por rol
        var recolectores = _.filter(Game.creeps, (creep) => creep.memory.role == 'recolector');
        var constructoresMid = _.filter(Game.creeps, (creep) => creep.memory.role == 'constructorMid');
        var constructoresBot = _.filter(Game.creeps, (creep) => creep.memory.role == 'constructorBot');
        var constructoresTop = _.filter(Game.creeps, (creep) => creep.memory.role == 'constructorTop');
        var recargadoresMid = _.filter(Game.creeps, (creep) => creep.memory.role == 'recargadorMid');
        var recargadoresBot = _.filter(Game.creeps, (creep) => creep.memory.role == 'recargadorBot');
        
        // Si el Controlador aún no es level 2
        if(Game.spawns.Central.room.controller.level < 2){
            
            if(recolectores.length < 1) { // Crear primer recolector
                var Recolector = Game.spawns['Central'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'recolector'});
            }
            else if(constructoresMid.length < 1) { // Crear primer constructor central
                var cm = Game.spawns['Central'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'constructorMid'});
            }
        }
        
        // Si el Controlador es level 2
        else if(Game.spawns.Central.room.controller.level == 2){
            
            // Si acaba de subir de nivel y aún no se guardó el progreso en Memory.datos
            if(!Memory.datos || Boolean(Memory.datos.controlador) == false){
    
                // Guardar dato
                Memory.datos.controlador = true;
                
                // Reciclar recolector a rol constructor superior
                for(var nombre in Game.creeps) { 
                    var minion = Game.creeps[nombre];
                    if(minion.memory.role == 'recolector'){
                        minion.memory.role = 'constructorTop';
                    }
                } 
            }
            // Si ya se guardó el upgrade del controlador en Memory.datos
            else{
                
                // Containers en construcción
                var enObras = Game.spawns.Central.room.find(FIND_CONSTRUCTION_SITES, { filter: (f) => f.structureType==STRUCTURE_CONTAINER });
                
                switch(enObras.length){ // Cantidad de Containers en construcción
                
                    case 2: // 2 Containers en construcción
                    
                        // Generar constructores
                        if(constructoresMid.length < 1) { 
                            var cm = Game.spawns['Central'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'constructorMid'});
                        }
                        else if(constructoresBot.length < 2) { 
                            var cb = Game.spawns['Central'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'constructorBot'});
                        }
                        else{
                            if(constructoresMid.length < 3) { 
                                var cm = Game.spawns['Central'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'constructorMid'});
                            }
                            else if(constructoresBot.length < 3) { 
                                var cb = Game.spawns['Central'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'constructorBot'});
                            }                            
                        }
                        if(constructoresTop.length < 1) {
                            var Recolector = Game.spawns['Central'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'constructorTop'});
                        }
                        break;
                    
                    case 1: // Container 1 finalizado
                    
                        // Convertir constructores centrales en recargadores centrales
                        if(constructoresMid.length > 0){
                            for(var nombre in Game.creeps) {  
                                var minion = Game.creeps[nombre];
                                if(minion.memory.role == 'constructorMid'){
                                    minion.memory.role = 'recargadorMid';
                                }
                            }
                        }
                        // Generar constructores
                        if(constructoresBot.length < 3) { 
                            var cb = Game.spawns['Central'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'constructorBot'});
                        }
                        else if(recargadoresMid.length < 3) {
                            var rm = Game.spawns['Central'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'recargadorMid'});
                        }
                        break;
                        
                    case 0: // Container 2 finalizado
                    
                        // Convertir constructores inferiores en recargadores inferiores
                        if(constructoresBot.length > 0){
                            for(var nombre in Game.creeps) {  
                                var minion = Game.creeps[nombre];
                                if(minion.memory.role == 'constructorBot'){
                                    minion.memory.role = 'recargadorBot';
                                }
                            }
                        }
                        break;
                }
            }
        }
        
        // Diferenciar creeps por su rol y asignar comportamiento
        for(var nombre in Game.creeps) {
            var minion = Game.creeps[nombre];
            if(minion.memory.role == 'recolector') {
                rolRecolector.run(minion);
            }
            if(minion.memory.role == 'recargadorBot') {
                rolRecargadorBot.run(minion);
            }
            if(minion.memory.role == 'recargadorMid') {
                rolRecargadorMid.run(minion);
            }
            if(minion.memory.role == 'constructorBot') {
                rolConstructorBot.run(minion);
            }
            if(minion.memory.role == 'constructorMid') {
                rolConstructorMid.run(minion);
            }
            if(minion.memory.role == 'constructorTop') {
                rolConstructorTop.run(minion);
            }
        }
    }
}
