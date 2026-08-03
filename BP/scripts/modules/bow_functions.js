import { world, EffectTypes, system, EntityHealthComponent, EntityComponentTypes, Entity, EquipmentSlot, MolangVariableMap } from "@minecraft/server";
import { vToLoc, checkHeldItem } from "../index.js"

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function diffLoc(loc1,loc2){ // only x and z
    return Math.abs(loc1.x-loc2.x) + Math.abs(loc1.z-loc2.z)
}
function addVectors(v1,v2){
    return {
        x: v1.x+v2.x,
        y: v1.y+v2.y,
        z: v1.z+v2.z,
    }
}
function formatVector(v){
    return `${v.x} ${v.y} ${v.z}`
}
function traceRayParametric(origin, direction, stepSize = 0.5, maxDistance = 10) {
    const points = [];
    
    // Normalize direction vector
    const len = Math.hypot(direction.x, direction.y, direction.z);
    if (len === 0) return points;
    
    const dirX = direction.x / len;
    const dirY = direction.y / len;
    const dirZ = direction.z / len;

    // Use Math.round to avoid floating-point truncations
    const totalSteps = Math.round(maxDistance / stepSize);

    // Increment distance t along ray: P(t) = O + t * D
    for (let i = 0; i <= totalSteps; i++) {
        const t = i * stepSize;
        
        points.push({
            x: origin.x + t * dirX,
            y: origin.y + t * dirY,
            z: origin.z + t * dirZ,
            t: t
        });
    }

    return points;
}


export function blaze_block(event){
    // type is block
    try {
        const block = event.getBlockHit().block
        if (block.isLiquid || !block.isValid ) {return;}
        event.dimension.createExplosion(block.location,1,{"breaksBlocks":false,"causesFire":true,})
        const fill_q = `${block.x-1} ${block.y-1} ${block.z-1} ${block.x+1} ${block.y+1} ${block.z+1}`
        event.source.runCommand(`fill ${fill_q} fire replace air`)
        return true;
    } catch (err) {
        console.log(err)
        return false;
    }
}
export function blaze_entity(event){
    // type is entity
    try {
        const entity = event.getEntityHit().entity
        event.dimension.createExplosion(entity.location,1,{"breaksBlocks":false,"causesFire":true,})
        entity.setOnFire(4,false)
        return true;
    } catch (err) {
        console.log(err)
        return false;
    }
}


export function bogged(event){
    try {
        const entity = event.getEntityHit().entity
        entity.addEffect("poison",(12*20))
        entity.addEffect("slowness",(12*20),{"amplifier":4})
        // event.dimension.playSound("minecraft:mob.bogged.step",entity.location)
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function breeze(event){
    try {
        const entity = event.getEntityHit().entity
        const incomingV = event.hitVector
        const magnitude = Math.sqrt(
            incomingV.x ** 2 + 
            incomingV.y ** 2 + 
            incomingV.z ** 2
        )
        if (magnitude === 0) return false;

        const unitX = incomingV.x / magnitude;
        const unitY = incomingV.y / magnitude;
        const unitZ = incomingV.z / magnitude;

        const horizontalStrength = 1; // Controls backward distance
        const verticalLift = 0.85;       // Controls pop-up height

        const impulseVector = {
            x: unitX * horizontalStrength,
            y: (Math.abs(unitY) * 0.2) + verticalLift, // Blends slight incoming vertical trajectory with uniform lift
            z: unitZ * horizontalStrength
        };
        entity.runCommand(`particle "minecraft:wind_explosion_emitter" ~~~`)
        entity.runCommand(`playsound wind_charge.burst @a ~~~`)
        entity.applyImpulse(impulseVector);
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function creaking(event){
    try {
        const entity = event.getEntityHit().entity
        entity.addEffect("blindness",(2*60*20)) // 2 minutes
        entity.addEffect("slowness",(5*20),{"amplifier":10})
        system.runTimeout(()=>{
            entity.addEffect("slowness",(60*20),{"amplifier":1})
        },5*20)
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function creeper_entity(event){
    try {
        const entity = event.getEntityHit().entity
        event.dimension.createExplosion(entity.location,4,{"breaks_blocks":true})
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function creeper_block(event){
    try {
        const proj = event.projectile
        event.dimension.createExplosion(proj.location,4,{"breaks_blocks":true})
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}

export function elder_guardian(event){
    try {
        const entity = event.getEntityHit().entity
        entity.addEffect("weakness",(20*20))
        entity.addEffect("mining_fatigue",(30*20),{"amplifier":2})
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function elder_guardian_release(event){
    try {
        event.source.runCommand("tag @e[type=arrow,c=1] add guardian")
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}

export function ender_dragon_block(event){
    try {
        const block = event.getBlockHit().block
        const proj = event.projectile
        if (proj.isValid){
            world.structureManager.place("wsp:dragon", event.dimension, proj.location)
        } else {
            world.structureManager.place("wsp:dragon", event.dimension, block.location)
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function ender_dragon_entity(event){
    try {
        const entity = event.getEntityHit().entity
        const proj = event.projectile
        if (proj.isValid){
            world.structureManager.place("wsp:dragon", event.dimension, proj.location)
        } else {
            world.structureManager.place("wsp:dragon", event.dimension, entity.location)
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}

export function endermite(event){
    try {
        const entity = event.getEntityHit().entity
        const changevector = {x:getRandomInt(-10,10),z:getRandomInt(-10,10)}
        const XZ = {x:entity.location.x + changevector.x, z:entity.location.z + changevector.z}
        const blockRay = event.dimension.getBlockFromRay({x:XZ.x,y:entity.location.y+4,z:XZ.z},{x:0,y:-1,z:0},{"includeLiquidBlocks":false,"includePassableBlocks":false,"maxDistance":25}).block
        const newV = {x:XZ.x, y:blockRay.y+1, z:XZ.z}
        // const newV = {x:XZ.x, y:event.dimension.getTopmostBlock(XZ).y+1, z:XZ.z}
        console.log(`${newV.x} ${newV.y} ${newV.z}`)
        entity.runCommand("execute positioned ~~1.5~ run function modules/ender_particle")
        entity.runCommand("playsound mob.endermen.portal @a ~~~")
        entity.tryTeleport(newV)
        system.runTimeout(()=>{
            entity.runCommand("execute positioned ~~1.5~ run function modules/ender_particle")
        },2)
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
const EVOKER_RADIUS = 1.25
const coords = [
    {
        x:0,
        y:0,
        z:EVOKER_RADIUS,
    },
    {
        x:0,
        y:0,
        z:-1*EVOKER_RADIUS,
    },
    {
        x:-1*EVOKER_RADIUS,
        y:0,
        z:0,
    },
    {
        x:EVOKER_RADIUS,
        y:0,
        z:0,
    },
    {
        x: EVOKER_RADIUS*(Math.sqrt(2)/2),
        y:0,
        z: EVOKER_RADIUS*(Math.sqrt(2)/2)
    },
    {
        x: EVOKER_RADIUS*(Math.sqrt(2)/2),
        y:0,
        z: -1*(EVOKER_RADIUS*(Math.sqrt(2)/2))
    },
    {
        x: -1*EVOKER_RADIUS*(Math.sqrt(2)/2),
        y:0,
        z: EVOKER_RADIUS*(Math.sqrt(2)/2)
    },
    {
        x: -1*EVOKER_RADIUS*(Math.sqrt(2)/2),
        y:0,
        z: -1*EVOKER_RADIUS*(Math.sqrt(2)/2)
    },
]
export function evoker_entity(event){
    try {
        const entity = event.getEntityHit().entity
        // const projV = event.hitVector
        // console.log(`${projV.x} ${projV.y} ${projV.z}`)
        if (!entity.isValid) return false;
        for (const xyz of coords){
            event.source.runCommand(`summon evocation_fang ${formatVector(addVectors(xyz,entity.location))}`)
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function evoker_block(event){
    try {
        const block = event.getBlockHit().block
        const proj = event.projectile
        for (const xyz of coords){
            event.source.runCommand(`summon evocation_fang ${formatVector(addVectors(xyz,proj.location))}`)
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function ghast_entity(event){
    try {
        const entity = event.getEntityHit().entity
        event.dimension.createExplosion(entity.location,1,{"breaksBlocks":true,"causesFire":true})
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function ghast_block(event){
    try {
        const block = event.getBlockHit().block
        event.dimension.createExplosion(block.location,2,{"breaksBlocks":true,"causesFire":true})
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}

export function guardian_release(event){
    try {
        event.source.runCommand("tag @e[type=arrow,c=1] add guardian")
        const player = event.source
        const useDuration = Math.abs(event.useDuration - 2000)
        var amplifier = 1;
        switch (true){
            case (useDuration >= 23):
                amplifier = 2
                break;
            case (useDuration >= 10 && useDuration < 23):
                amplifier = 1.2
                break;
        }
        player.runCommand("tag @e[type=arrow,c=1] add guardian_laser")
        player.runCommand("kill @e[type=arrow,c=1,tag=guardian_laser]")
        const headLoc = addVectors(player.location,{x:0,y:1.75,z:0})
        const lookat = addVectors(player.getViewDirection(),headLoc)
        const raycastHits = player.getEntitiesFromViewDirection({"max_distance":24,"ignoreBlockCollision":false,"excludeTypes":["minecraft:arrow","minecraft:armor_stand"]})
        if (raycastHits && raycastHits[0]){
            for (const ent of raycastHits){
                ent.entity.applyDamage(5*amplifier,{"cause":"magic"})
            }
        }

        const myVarMap = new MolangVariableMap()
        myVarMap.setVector3("variable.my_vector",player.getViewDirection())
        const rayPoints = traceRayParametric(headLoc, player.getViewDirection(), 0.2, 24)
        for (const point of rayPoints){
            player.dimension.spawnParticle("wsp:guardian_beam", point, myVarMap)
            player.dimension.spawnParticle("wsp:guardian_beam2", point, myVarMap)
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}

export function guardian_block(event){
    try {
        const proj = event.projectile
        if (proj.isValid) proj.removeTag("guardian")
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function hoglin(event){
    try {
        const entity = event.getEntityHit().entity
        const incomingV = event.hitVector
        const magnitude = Math.sqrt(
            incomingV.x ** 2 + 
            incomingV.y ** 2 + 
            incomingV.z ** 2
        )
        if (magnitude === 0) return false;

        const unitX = incomingV.x / magnitude;
        const unitY = incomingV.y / magnitude;
        const unitZ = incomingV.z / magnitude;

        const horizontalStrength = 1.75; // Controls backward distance
        const verticalLift = 0.3;       // Controls pop-up height
        const impulseVector = {
            x: unitX * horizontalStrength,
            y: (Math.abs(unitY) * 0.2) + verticalLift, // Blends slight incoming vertical trajectory with uniform lift
            z: unitZ * horizontalStrength
        };
        entity.applyImpulse(impulseVector);
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function husk(event){
    try {
        const entity = event.getEntityHit().entity
        if (entity.typeId === "minecraft:player"){
            entity.addEffect("hunger",(10*20),{"amplifier":255})
            system.runTimeout(() => {
                entity.addEffect("hunger",(2*60*20))
            },10*20)
        } else {
            entity.addEffect("wither",(20*20))
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function magma_block(event){
    try {
        const proj = event.projectile
        if (proj.isValid) proj.removeTag("magma")
        // const block = event.getBlockHit().block
        
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function magma_release(event){
    try {
        event.source.runCommand("tag @e[type=arrow,c=1] add magma")
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function parched(event){
    try {
        const entity = event.getEntityHit().entity
        entity.addEffect("slowness",(10*20),{"amplifier":3})
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function phantom_release(event){
    try {
        const player = event.source
        const useDuration = Math.abs(event.useDuration - 2000)
        var amplifier = 1;
        switch (true){
            case (useDuration >= 23):
                amplifier = 2
                break;
            case (useDuration >= 10 && useDuration < 23):
                amplifier = 1.2
                break;
        }
        player.runCommand("tag @e[type=arrow,c=1] add phantom")
        player.runCommand("kill @e[type=arrow,c=1,tag=phantom]")
        const headLoc = addVectors(player.location,{x:0,y:1.75,z:0})
        const lookat = addVectors(player.getViewDirection(),headLoc)
        const raycastHits = player.getEntitiesFromViewDirection({"max_distance":100,"ignoreBlockCollision":false,"excludeTypes":["minecraft:arrow","minecraft:armor_stand"]})
        if (raycastHits && raycastHits[0]){
            for (const ent of raycastHits){
                ent.entity.applyDamage(5*amplifier,{"cause":"contact"})
            }
        }
        const rayPoints = traceRayParametric(headLoc, player.getViewDirection(), 1, 100)
        for (const point of rayPoints){
            if (player.dimension.isChunkLoaded(point)) {
                player.dimension.spawnParticle("wsp:phantom",point)
            }
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function piglin_brute(event){
    try {
        const entity = event.getEntityHit().entity
        const proj = event.projectile
        entity.applyDamage(12) // instant damage 
        if (proj.isValid) proj.removeTag("piglin_brute")
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function piglin_brute_release(event){
    try {
        event.source.runCommand("tag @e[type=arrow,c=1] add piglin_brute")
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}

// Pillager item Components changed, no function needed

export function ravager(event){
    try {
        const entity = event.getEntityHit().entity
        if (entity.isValid && entity.typeId == "minecraft:player"){
            const equippable = entity.getComponent("minecraft:equippable");
                
                if (equippable) {
                    const offhandItem = equippable.getEquipment(EquipmentSlot.Offhand);
                    
                    if (offhandItem) {
                        console.warn(`Player is holding: ${offhandItem.typeId}`);
                        if (offhandItem.typeId == "minecraft:shield"){
                            equippable.setEquipment(EquipmentSlot.Offhand)
                            system.runTimeout(()=>{
                                entity.dimension.playSound("random.break",entity.location,{"volume":15})
                            },4)
                            return true;
                        }
                    } 
                }
                if (checkHeldItem(entity)=="minecraft:shield"){
                    const heldItem = entity.getComponent('inventory').container.setItem(entity.selectedSlotIndex)
                    system.runTimeout(()=>{
                        entity.dimension.playSound("random.break",entity.location,{"volume":15})
                    },4)
                    return true
                }
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function shulker(event){
    try {
        const entity = event.getEntityHit().entity
        entity.addEffect("levitation",(10*20))
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function shulker_release(event){
    try {
        event.source.runCommand("tag @e[type=arrow,c=1] add shulker")
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function shulker_block(event){
    try {
        const proj = event.projectile
        if (proj.isValid) proj.removeTag("shulker")
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function silverfish(event){
    try {
        // const block = event.getBlockHit().block
        // const entity = event.getEntityHit().entity
        event.source.addTag("silverfish")
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function silverfish_block(event){
    try {
        const block = event.getBlockHit().block
        const proj = event.projectile
        if (proj.isValid){
            proj.dimension.spawnEntity("minecraft:silverfish",proj.location)
        } else {
            block.dimension.spawnEntity("minecraft:silverfish",block.location)
        }
        // const entity = event.getEntityHit().entity
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function silverfish_entity(event){
    try {
        const entity = event.getEntityHit().entity
        const proj = event.projectile
        if (proj.isValid){
            proj.dimension.spawnEntity("minecraft:silverfish",proj.location)
        } else {
            entity.dimension.spawnEntity("minecraft:silverfish",entity.location)
        }
        // const entity = event.getEntityHit().entity
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function skeleton(event){
    try {
        const entity = event.getEntityHit().entity
        entity.applyDamage(5) // always does more and cirt is increased in the item component
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function slime_release(event){
    try {
        const player = event.source
        const dimension = player.dimension;
        const headLocation = player.getHeadLocation();
        const viewVector = player.getViewDirection();

        player.runCommand("tag @e[type=arrow,c=1] add slimeball")
        player.runCommand("kill @e[type=arrow,c=1,tag=slimeball]")
        // Spawn your custom projectile entity just in front of the player's head
        const projectile = dimension.spawnEntity("wsp:slimeball", {
            x: headLocation.x + viewVector.x,
            y: headLocation.y + viewVector.y,
            z: headLocation.z + viewVector.z
        });

        const useDuration = Math.abs(event.useDuration - 2000)
        var amplifier = 1.5;
        switch (true){
            case (useDuration >= 23):
                amplifier = 2.5
                break;
            case (useDuration >= 10 && useDuration < 23):
                amplifier = 2
                break;
        }
        const velocity = {
            x: viewVector.x * amplifier,
            y: viewVector.y * amplifier + (amplifier*0.1),
            z: viewVector.z * amplifier
        };
        projectile.applyImpulse(velocity);
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function stray(event){
    try {
        const entity = event.getEntityHit().entity
        entity.addEffect("slowness",30*20,{"amplifier":255,"showParticles":false}) // stops moving 
        const freezeparticles = system.runInterval(()=>{
            if (entity.isValid) {
                entity.runCommand(`particle "minecraft:ice_evaporation_emitter" ~-0.2~~-0.2`)
            }
        },8)
        system.runTimeout(()=>{
            system.clearRun(freezeparticles)
        },30*20)
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function sulfur_block(event){
    try {
        const block = event.getBlockHit().block
        const proj = event.projectile
        if (proj.isValid){
            world.structureManager.place("wsp:sulfur", event.dimension, proj.location)
        } else {
            world.structureManager.place("wsp:sulfur", event.dimension, block.location)
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function sulfur_entity(event){
    try {
        const entity = event.getEntityHit().entity
        const proj = event.projectile
        if (proj.isValid){
            world.structureManager.place("wsp:sulfur", event.dimension, proj.location)
        } else {
            world.structureManager.place("wsp:sulfur", event.dimension, entity.location)
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function vex_release(event){
    try {
        const player = event.source
        const useDuration = Math.abs(event.useDuration - 2000)
        var amplifier = 1;
        switch (true){
            case (useDuration >= 23):
                amplifier = 2
                break;
            case (useDuration >= 10 && useDuration < 23):
                amplifier = 1.2
                break;
        }
        player.runCommand("tag @e[type=arrow,c=1] add vex")
        player.runCommand("kill @e[type=arrow,c=1,tag=vex]")
        const headLoc = addVectors(player.location,{x:0,y:1.75,z:0})
        const lookat = addVectors(player.getViewDirection(),headLoc)
        const raycastHits = player.getEntitiesFromViewDirection({"max_distance":45,"ignoreBlockCollision":true,"excludeTypes":["minecraft:arrow","minecraft:armor_stand"]})
        if (raycastHits && raycastHits[0]){
            for (const ent of raycastHits){
                ent.entity.applyDamage(5*amplifier,{"cause":"magic"})
            }
        }
        const rayPoints = traceRayParametric(headLoc, player.getViewDirection(), 1, 45)
        for (const point of rayPoints){
            player.dimension.spawnParticle("wsp:vex",point)
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function vindicator(event){
    try {
        const entity = event.getEntityHit().entity
        const health = entity.getComponent(EntityComponentTypes.Health);
        console.log(health.currentValue)
        console.log(health.defaultValue)
        if (health.currentValue<=health.defaultValue*0.25){
            entity.dimension.spawnParticle("minecraft:magic_critical_hit_emitter",addVectors(entity.location,{x:0,y:2,z:0}))
            health.resetToMinValue();

        }
        // particles?
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}

export function warden_block(event){
    try {
        const proj = event.projectile
        if (proj.isValid) proj.removeTag("warden")
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function warden_release(event){
    try {
        event.source.runCommand("particle minecraft:sonic_explosion ^^1^1.5")
        event.source.runCommand("particle minecraft:sonic_explosion ^^1^4")
        event.source.runCommand("tag @e[type=arrow,c=1] add warden")
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function witch(event){
    try {
        const entity = event.getEntityHit().entity
        const potions=[
            "slowness",
            "poison",
            "weakness",
            "instant_damage"
        ]
        const randomPotion = potions[Math.floor(Math.random() * potions.length)]
        console.log(randomPotion)
        console.log((randomPotion=="instant_damage" ? 1 : 15*20))
        entity.addEffect(randomPotion,(randomPotion=="instant_damage" ? 1 : 15*20),{"amplifier":1})
        entity.dimension.playSound("random.glass",entity.location,{"volume":105})
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function wither(event){
    try {
        const entity = event.getEntityHit().entity
        const skull_count = event.source.getDynamicProperty("skull_count")
        let amplifier = 1
        let rad = 1
        console.log(`skull count ${skull_count}`)
        if (skull_count >= 4){
            rad = 6 
            amplifier = 3
            event.source.setDynamicProperty("skull_count",0)
        } else event.source.setDynamicProperty("skull_count",skull_count+1)
        entity.addEffect("wither",10*20,{"amplifier":amplifier})
        event.dimension.createExplosion(entity.location,rad,{"breaksBlocks":true})
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function wither_block(event){
    try {
        const block = event.getBlockHit().block
        const proj = event.projectile
        if (proj.isValid) proj.removeTag("wither")
        const skull_count = event.source.getDynamicProperty("skull_count")
        let amplifier = 1
        let rad = 1
        console.log(`skull count ${skull_count}`)
        if (skull_count >= 4){
            rad = 4 
            amplifier = 3
            event.source.setDynamicProperty("skull_count",0)
        } else event.source.setDynamicProperty("skull_count",skull_count+1)
        event.dimension.createExplosion(block.location,rad,{"breaksBlocks":true})
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}
export function wither_release(event){
    try {
        event.source.runCommand("tag @e[type=arrow,c=1] add wither")
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function wither_skeleton(event){
    try {
        const entity = event.getEntityHit().entity
        entity.addEffect("wither",10*20)
        entity.setOnFire(25,false)
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function zoglin(event){
    try {
        const entity = event.getEntityHit().entity
        const player = event.source
        if (player.isValid && player.typeId == "minecraft:player" && entity.isValid){
            const distance = diffLoc(player.location,entity.location)
            var amplifier = 1;
            switch (true){
                case ( distance >= 35):
                    amplifier = 2;
                    break;
                case ( distance >= 65):
                    amplifier = 3;
                    break;
            }
            console.log(`${distance}`);
            console.log(`${amplifier}`);
            player.addTag("zoglin")
            player.addEffect("speed",5*amplifier,{"amplifier":amplifier*10})


            system.runTimeout(()=>{
                player.addEffect("speed",30*20,{"amplifier":amplifier})
                player.addEffect("strength",20*20,{"amplifier":amplifier})
            },5)
        }
        // add particles to player
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function zombie(event){
    try {
        const entity = event.getEntityHit().entity
        if (entity.isValid && entity.typeId == "minecraft:player"){
            entity.addEffect("blindness",20*20)
            entity.addEffect("nausea",20*20)
        } else {
            entity.addEffect("poison",10*20)
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}


export function zombie_villager(event){
    try {
        const entity = event.getEntityHit().entity
        entity.addEffect("weakness",50*20)
        console.log(entity.typeId)
        if (entity.isValid && entity.typeId == "minecraft:zombie_villager_v2"){
            entity.triggerEvent("villager_converted")
        }
        return true;
    } catch (err){
        console.log(err)
        return false;
    }
}