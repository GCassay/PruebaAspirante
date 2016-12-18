/**************************************************************************
* README
***************************************************************************
* 1. Coordenadas a asignar al Spawn inicial -> X:25 Y:25
* 2. Nombre asignado al Spawn -> Central
* 3. Activar 'Show flags' en DISPLAY OPTIONS
* 4. Los minutos totales de ejecución se muestran por consola al finalizar
* 5. Descomentar línea 84 para visualizar contador de ticks en consola
***************************************************************************
* El código genera:
* Construcción de 2 Containers y carga de energía
* Construcción de 1 Road path
* Carga de contenedores
* Upgrade del Controller
***************************************************************************
* Autor: G. Cassinello
***************************************************************************/

// Cargar módulos
var rolRecolector = require('rol.recolector'); // Obtener energía para transferir al Spawn
var rolRecargadorBot = require('rol.recargadorBot'); // Obtener energía de la fuente inferior para transferir a estructuras
var rolRecargadorMid = require('rol.recargadorMid'); // Obtener energía de la fuente central para transferir a estructuras
var rolRecargadorTop = require('rol.recargadorTop'); // Obtener energía de la fuente superior para transferir a estructuras
var rolConstructorBot = require('rol.constructorBot'); // Obtener energía de la fuente inferior para transferir a estructuras
var rolConstructorMid = require('rol.constructorMid'); // Obtener energía de la fuente central para transferir a estructuras
var rolConstructorTop = require('rol.constructorTop'); // Obtener energía de la fuente central para transferir a estructuras

module.exports.loop = function () {

    // Control de tiempo y ticks de la prueba
    if(Game.time == 1){ // Se inicia el contador desde 1 ya que eventualmente la consola del simulador no muestra el registro del tick 0
        console.log('INICIO DE LA PRUEBA');
        if(!Memory.datos){ // Se guarda el Epoch Time del instante en que se posiciona el primer Spawn
            Memory.datos = {
              epoch: String(Date.now()),
              controlador: false, // Si el controlador es level 2 y se pueden crear extensiones
              contenedorX: 34, // Coordenada x de Contenedor 1
              contenedorY: 23, // Coordenada y de Contenedor 1
              contenedor2X: 41, // Coordenada x de Contenedor 2 
              contenedor2Y: 42 // Coordenada y de Contenedor 2
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
        var final = parseInt(Date.now()); // Se obtiene el Epoch Time del instante en que se alcanzan los 2000 ticks
        var inicio = parseInt(Memory.datos.epoch); // Se recoge el Epoch Time de inicio
        var tiempo = final - inicio; // Se calculan los milisegundos transcurridos
        // Se usa como medida de tiempo el minuto
        var tiempo = Math.floor(tiempo / 60000); // Se convierten milisegundos a minutos
        console.log('TIEMPO TRANSCURRIDO: '+ tiempo +' minutos');
        
        // Se genera un elemento flag en el mapa indicando el final del contador
        Game.rooms.sim.createFlag(25, 25, 'Tiempo Finalizado', COLOR_WHITE); 
        
        // Eliminar creeps
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
    
        // console.log(Game.time); // Contador
        
        // Filtros de Creeps por rol
        var recolectores = _.filter(Game.creeps, (creep) => creep.memory.role == 'recolector');
        var constructoresMid = _.filter(Game.creeps, (creep) => creep.memory.role == 'constructorMid');
        var constructoresBot = _.filter(Game.creeps, (creep) => creep.memory.role == 'constructorBot');
        var constructoresTop = _.filter(Game.creeps, (creep) => creep.memory.role == 'constructorTop');
        var recargadoresMid = _.filter(Game.creeps, (creep) => creep.memory.role == 'recargadorMid');
        var recargadoresBot = _.filter(Game.creeps, (creep) => creep.memory.role == 'recargadorBot');
        var recargadoresTop = _.filter(Game.creeps, (creep) => creep.memory.role == 'recargadorTop');
        
        // Si el Controlador aún no es level 2
        if(Game.spawns.Central.room.controller.level < 2){
            if(recolectores.length < 1) { // Crear recargador
                var Recolector = Game.spawns['Central'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'recolector'});
            }
            else if(constructoresMid.length < 1) { 
                var cm = Game.spawns['Central'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'constructorMid'});
            }
        }
        // Si el Controlador es level 2
        else if(Game.spawns.Central.room.controller.level == 2){
            
            // Si acaba de subir de nivel y aún no se guardó el progreso en Memory.datos
            if(!Memory.datos || Boolean(Memory.datos.controlador) == false){
            
                // Crear ConstructionSite para 1 Extensión
                //Game.rooms.sim.createConstructionSite(parseInt(Memory.datos.extensionX), parseInt(Memory.datos.extensionY), STRUCTURE_EXTENSION); 
    
                // Guardar confirmación
                Memory.datos.controlador = true;
                
                // Reciclar los creeps que subieron el Controlador
                // Asignar rol recolector
                for(var nombre in Game.creeps) { 
                    var minion = Game.creeps[nombre];
                    if(minion.memory.role == 'recolector'){
                        minion.memory.role = 'constructorTop';
                    }
                } 
            }
            // Si ya se guardó el progreso en Memory.datos
            else{
                
                // Estructuras en construcción
                var enObras = Game.spawns.Central.room.find(FIND_CONSTRUCTION_SITES, { filter: (f) => f.structureType==STRUCTURE_CONTAINER });
                
                switch(enObras.length){ // Cantidad de estructuras en construcción
                
                    case 2: // 2 Contenedores en construcción
                    
                        // Generar constructores centrales e inferiores
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
                        if(constructoresTop.length < 1) { // Crear recargador
                            var Recolector = Game.spawns['Central'].createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'constructorTop'});
                        }
                        break;
                    
                    case 1: // Contenedor 1 finalizado
                    
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
                    
                        if(constructoresBot.length > 0){
                            for(var nombre in Game.creeps) {  // Convertir constructores inferiores en recargadores inferiores
                                var minion = Game.creeps[nombre];
                                if(minion.memory.role == 'constructorBot'){
                                    minion.memory.role = 'recargadorBot';
                                }
                            }
                        }
                        
                       // var c = Game.rooms.sim.getPositionAt(parseInt(Memory.datos.contenedorX),parseInt(Memory.datos.contenedorY));
                        //var contenedor1Construccion = c.findInRange(FIND_STRUCTURES, 0);

                        if(constructoresMid.length > 0){
                            for(var nombre in Game.creeps) {  // Convertir constructores centrales en recargadores centrales
                                var minion = Game.creeps[nombre];
                                if(minion.memory.role == 'constructorMid'){
                                    minion.memory.role = 'recargadorMid';
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
            if(minion.memory.role == 'recargadorTop') {
                rolRecargadorTop.run(minion);
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
