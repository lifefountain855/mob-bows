import { world, system, ItemStack, } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { bowType, eventTypes } from "modules/definitions.js";
import * as c from "modules/definitions.js"
import * as f from "modules/bow_functions.js"
import { PILLAGER } from "./modules/definitions";


function getBow(bow){
  if (bow){
    return c.allBows[bow]
  }
}
function getAllBows(){
  return Object.entries(c.allBows);
}

export function vToLoc(v){
  return `${v.x} ${v.y} ${v.z}`
}
function diffLoc(loc1,loc2){ // all
    return Math.abs(loc1.x-loc2.x) + Math.abs(loc1.y-loc2.y) + Math.abs(loc1.z-loc2.z)
}

export function checkHeldItem(player) {
    const selectedIndex = player.selectedSlotIndex;
    const inventory = player.getComponent('inventory');
    if (inventory) {
        const heldItem = inventory.container.getItem(selectedIndex);
        if (heldItem) {
            return heldItem.typeId;
        }
    }
    return undefined
}

function giveGuideBook(player) {
    // 1. Create a written book item stack
    const book = new ItemStack("minecraft:written_book", 1);
    
    // 2. Get the book content component
    const bookComponent = book.getComponent("book");
    console.log(book.typeId)
    
    if (bookComponent) {
        // 3. Configure the book's metadata and content
        // bookComponent.title = "§6The Ancient Lore"; // Supports color codes!
        // bookComponent.author = "The Arch-Mage";
        
        // 4. Set pages (Array of strings)
        bookComponent.setContents([
            {translate: "book.chapter1"},
            {translate: "book.page2"},
            {translate: "book.page3"},
            {translate: "book.page4"},
            {translate: "book.chapter2"},
            {translate: "book.page6"},
            {translate: "book.bow.blaze"},
            {translate: "book.bow.bogged"},
            {translate: "book.bow.breeze"},
            {translate: "book.bow.creaking"},
            {translate: "book.bow.creeper"},
            {translate: "book.bow.elder_guardian"},
            {translate: "book.bow.ender_dragon"},
            {translate: "book.bow.endermite"},
            {translate: "book.bow.evoker"},
            {translate: "book.bow.ghast"},
            {translate: "book.bow.guardian"},
            {translate: "book.bow.hoglin"},
            {translate: "book.bow.husk"},
            {translate: "book.bow.magma"},
            {translate: "book.bow.parched"},
            {translate: "book.bow.phantom"},
            {translate: "book.bow.piglin_brute"},
            {translate: "book.bow.pillager"},
            {translate: "book.bow.ravager"},
            {translate: "book.bow.shulker"},
            {translate: "book.bow.silverfish"},
            {translate: "book.bow.skeleton"},
            {translate: "book.bow.slime"},
            {translate: "book.bow.stray"},
            {translate: "book.bow.sulfur"},
            {translate: "book.bow.vex"},
            {translate: "book.bow.vindicator"},
            {translate: "book.bow.warden"},
            {translate: "book.bow.witch"},
            {translate: "book.bow.wither"},
            {translate: "book.bow.wither_skeleton"},
            {translate: "book.bow.zoglin"},
            {translate: "book.bow.zombie"},
            {translate: "book.bow.zombie_villager"},
        ]);

        bookComponent.signBook(c.LANG[player.clientSystemInfo.locale].title,"WhispyDEV")
    }
    
    // 5. Give the item to the player
    const inventory = player.getComponent("inventory").container;
    inventory.addItem(book);
}

// when item released
world.afterEvents.itemReleaseUse.subscribe((event) => {
  const { source, itemStack, useDuration } = event;
  if (source && source.typeId === "minecraft:player") {
    // world.clearDynamicProperties()
    world.setDynamicProperty(`${source.name}:lastuseditem`, `${itemStack.typeId}`)
    let helditem = itemStack.typeId
    const allbowslocal=getAllBows()
    for (const i in allbowslocal){
      const bow = allbowslocal[i][1]
      if ((bow.eventType==eventTypes.RELEASE || bow.eventType2==eventTypes.RELEASE || bow.eventType3==eventTypes.RELEASE)&& bow.id==helditem) {
        if (bow.id==helditem){
          if (useDuration <= 1996){
            source.removeTag("silverfish")
            console.log(`${bow.id} -- result:${bow.run(eventTypes.RELEASE,event)}`)
            bow.playSound(source.dimension,source.location)
          } else if (bow.id == PILLAGER && useDuration<=1998){
            source.removeTag("silverfish")
            console.log(`${bow.id} -- result:${bow.run(eventTypes.RELEASE,event)}`)
            bow.playSound(source.dimension,source.location)
          }
        }
      }
    }
    
  }
})

// arrow hitting a block
world.afterEvents.projectileHitBlock.subscribe((event) => {
  const projectile = event.projectile;
  const hitBlock = event.getBlockHit();
  const source = event.source;
  if (source && source.typeId === "minecraft:player") {
    if (projectile.typeId === "minecraft:arrow" && hitBlock) {
      if (!projectile.dimension.isChunkLoaded(projectile.location) || !projectile.isValid ) {projectile.kill();return;}
      let helditem=world.getDynamicProperty(`${source.name}:lastuseditem`) ?? checkHeldItem(source)
      if (helditem){
        const allbowslocal=getAllBows()
        for (const i in allbowslocal){
          const bow = allbowslocal[i][1]
          if ((bow.eventType==eventTypes.BLOCK || bow.eventType2==eventTypes.BLOCK || bow.eventType3==eventTypes.BLOCK) && bow.id==helditem) {
            console.log(`${bow.id} -- result:${bow.run(eventTypes.BLOCK,event)}`)
          }
        }
      }
    }
  }
})

// arrow hitting an entity
world.afterEvents.projectileHitEntity.subscribe((event) => {
  const projectile = event.projectile;
  const hitEntity = event.getEntityHit().entity;
  const source = event.source;
  if (source && source.typeId === "minecraft:player") {
    if (projectile.typeId === "minecraft:arrow" && hitEntity.isValid) {
      if (projectile.isValid) {
        if (!projectile.dimension.isChunkLoaded(projectile.location)) {
          projectile.kill();return;
        }
      }
      let helditem=world.getDynamicProperty(`${source.name}:lastuseditem`) ?? checkHeldItem(source)
      if (helditem){
        const allbowslocal=getAllBows()
        for (const i in allbowslocal){
          const bow = allbowslocal[i][1]
          if ((bow.eventType==eventTypes.ENTITY || bow.eventType2==eventTypes.ENTITY || bow.eventType3==eventTypes.ENTITY)  && bow.id == helditem) {
            console.log(`${bow.id} -- result:${bow.run(eventTypes.ENTITY,event)}`)
          }
        }
      }
    }
  }
})



// Soul dropping behavior
world.afterEvents.entityDie.subscribe((event) => {
  const { damageSource, deadEntity } = event;
  if (damageSource.damagingEntity && damageSource.damagingEntity.typeId === "minecraft:player"){
    const player = damageSource.damagingEntity
    const item = checkHeldItem(player)
    // player.sendMessage(`PLAYER KILLED with ${item}`)
    if (item && item === c.SOUL_HARVESTER){
      // player.sendMessage(`SPAWNED SOUL ${vToLoc(deadEntity.location)}`)
      player.runCommand(`loot spawn ${vToLoc(deadEntity.location)} loot "soul_drops/soul_drop"`)
    }
  }
})


world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  const { block, player } = event;
  // Replace with your custom station block identifier
  if (block.typeId === "wsp:soul_forge") {
    system.runTimeout(() => {
      // processSoulAnvilLogic(block, player);
    }, 5);
  }
});

world.afterEvents.playerSpawn.subscribe((event)=>{
  const { initialSpawn, player } = event;
  player.setDynamicProperty("skull_count",0)

  if (initialSpawn) {
    const hasJoinedBefore = player.getDynamicProperty("has_joined");
    
    if (!hasJoinedBefore) {
      // Set the property so this block never runs for them again
      player.setDynamicProperty("has_joined", true);
      
      // Execute your first-join logic here
      player.sendMessage("Welcome to the world for the very first time!");
    }
  }
})
system.afterEvents.scriptEventReceive.subscribe((event)=>{
  const { id, sourceEntity } = event;
  if (id == 'wsp:book') giveGuideBook(sourceEntity)
})


world.afterEvents.worldLoad.subscribe(() => {
    
})


world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const { player, block, isFirstEvent } = event;
  if (block && block.typeId == "wsp:mob_forge" && isFirstEvent){
      system.run(()=>{
        openFlexibleRepairMenu(player);
      });
    } 
})
const DURABILITY_RESTORE_PERCENT = 0.20;          // 20% health restored per action
function openFlexibleRepairMenu(player) {
    const inventory = player.getComponent("minecraft:inventory").container;
    const repairableTools = [];

    // Scan player inventory for damaged "wsp:" items
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (!item || !item.typeId.startsWith("wsp:")) continue;

        const durabilityComp = item.getComponent("minecraft:durability");
        if (durabilityComp && durabilityComp.damage > 0) {
            
            // Check if they have the default repair crystal
            let hasDefaultMaterial = false;
            // Check if they have the specific alternative material (if it exists for this item)
            let hasAltMaterial = false;
            const altMaterialId = c.ALTERNATIVE_RECIPES[item.typeId];

            for (let j = 0; j < inventory.size; j++) {
                const materialCheck = inventory.getItem(j);
                if (!materialCheck || materialCheck.amount <= 0) continue;

                if (materialCheck.typeId === c.SOUL) {
                    hasDefaultMaterial = true;
                }
                if (altMaterialId && materialCheck.typeId === altMaterialId) {
                    hasAltMaterial = true;
                }
            }
            const canRepair = hasDefaultMaterial || hasAltMaterial;
            var indicatorText;
            if (hasAltMaterial) {
                indicatorText = ` [§g✦ §r§l`;
            } else if (hasDefaultMaterial) {
                indicatorText = ` [§2✔ §r§l`;
            } else {
                indicatorText = ` [§cX §r§l`;
            } 
            repairableTools.push({ 
                item, 
                slot: i, 
                altMaterial: altMaterialId,
                canRepair: canRepair,
                indicatorText: indicatorText,
                chosenMaterialId: hasAltMaterial ? altMaterialId : c.SOUL
            });
        }
    }

    if (repairableTools.length === 0) {
        player.sendMessage({ translate: "commands.wsp.repair.no_damaged_tools" });
        return;
    }

    // Generate Form
    const repairForm = new ActionFormData()
        .title({ translate: "wsp.repair.title.primary" })
        .body({ translate: "wsp.repair.body.multi_material" });

    repairableTools.forEach(({ chosenMaterialId, item, canRepair, slot, indicatorText }) => {
      repairForm.button({
            rawtext: [
                { text: indicatorText },
                { translate: `item.${chosenMaterialId.startsWith("minecraft:") ? chosenMaterialId.replace("minecraft:","")+".name" : chosenMaterialId}`},
                { text: " - "},
                { translate: `item.${item.typeId}` },
                { text: " " },
                { translate: "wsp.word.item.slot" },
                { text: `: ${slot+1} ]§r`}
            ]
        });
    });

    repairForm.show(player).then((response) => {
        if (response.canceled || response.selection === undefined) return;
        const selectedTool = repairableTools[response.selection];

        if (selectedTool && !selectedTool.canRepair) {
            // Error handling: build a message showing they need either item
            if (selectedTool.altMaterial) {
                // player.sendMessage({
                //     translate: "commands.wsp.repair.missing_either_material",
                //     with: [
                //         `item.${c.SOUL}`,
                //         `item.${selectedTool.altMaterial}`
                //     ]
                // });
                player.sendMessage({
                  "rawtext":[  
                    { translate: "commands.wsp.repair.missing_either_material"},
                    { text: " " },
                    { translate: `item.${selectedTool.altMaterial.startsWith("minecraft:") ? selectedTool.altMaterial.replace("minecraft:","")+".name" : selectedTool.altMaterial}`},
                    { text: " / " },
                    { translate: `item.${c.SOUL}`},
                    { text: "§r"}
                  ]
                });
            } else {
                // player.sendMessage({
                //     translate: "commands.wsp.repair.missing_material",
                //     with: [`item.${c.SOUL}`]
                // });
                player.sendMessage({
                  "rawtext":[
                    { translate: "commands.wsp.repair.missing_material"},
                    { text: " " },
                    { translate: `item.${c.SOUL}`},
                    { text: "§r"}
                  ]
                });
            }
            return;
        }

        processFlexibleRepair(player, selectedTool.slot, selectedTool.altMaterial);
    });
}

function processFlexibleRepair(player, toolSlot, altMaterialTypeId) {
    const inventory = player.getComponent("minecraft:inventory").container;
    const tool = inventory.getItem(toolSlot);
    
    if (!tool) return;

    const durabilityComp = tool.getComponent("minecraft:durability");
    if (!durabilityComp || durabilityComp.damage === 0) return;

    // Determine which material to actually consume. 
    // We prioritize the alternative material (e.g. string) if they have it, otherwise use the crystal.
    let targetMaterialId = c.SOUL;

    if (altMaterialTypeId) {
        for (let i = 0; i < inventory.size; i++) {
            const checkItem = inventory.getItem(i);
            if (checkItem && checkItem.typeId === altMaterialTypeId && checkItem.amount > 0) {
                targetMaterialId = altMaterialTypeId;
                break;
            }
        }
    }

    // Deduct 1 unit of the chosen material type
    let materialConsumed = false;
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && item.typeId === targetMaterialId) {
            if (item.amount > 1) {
                item.amount -= 1;
                inventory.setItem(i, item);
            } else {
                inventory.setItem(i, undefined);
            }
            materialConsumed = true;
            break;
        }
    }

    if (!materialConsumed) return; 

    // Apply repair math while preserving enchantments untouched on the clone
    const maxDurability = durabilityComp.maxDurability;
    const restoreAmount = Math.floor(maxDurability * DURABILITY_RESTORE_PERCENT);
    const newDamage = Math.max(0, durabilityComp.damage - restoreAmount);

    const repairedTool = tool.clone();
    repairedTool.getComponent("minecraft:durability").damage = newDamage;

    inventory.setItem(toolSlot, repairedTool);

    player.sendMessage({ translate: "commands.wsp.repair.success" });
    player.playSound("random.anvil_use");
}