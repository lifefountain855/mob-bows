
world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const { player, block } = event;
    console.log(`Globally intercepted click on: ${block.typeId}`);
    if (!player || block.typeId != "wsp:mob_forge") return;
      const inventory = player.getComponent("minecraft:inventory").container;
      const itemsSnapshot = new Map();

      // Take a precise snapshot of all enchantable items currently in their inventory
      for (let i = 0; i < inventory.size; i++) {
          const item = inventory.getItem(i);
          if (item) {
              const enchantComponent = item.getComponent("minecraft:enchantable");
              if (enchantComponent && enchantComponent.getEnchantments().length > 0) {
                  itemsSnapshot.set(i, {
                      typeId: item.typeId,
                      enchantments: enchantComponent.getEnchantments()
                  });
                  // console.log(item.typeId)
              }
          }
      }
      // Save the session with the location of the block and the item snapshot
      activeRepairSessions.set(player.id, {
          blockLocation: block.location,
          snapshot: itemsSnapshot
      });
});


import {BlockComponentRegistry} from "@minecraft/server"
// Keep track of players actively using our repair bench
const activeRepairSessions = new Map();
const RepairTracker = {
  onPlayerInteract(event) {
      console.log("hi")
      const { entity, block } = event;
      const player = entity
      // if (!player) return;

      // const inventory = player.getComponent("minecraft:inventory").container;
      // const itemsSnapshot = new Map();

      // // Take a precise snapshot of all enchantable items currently in their inventory
      // for (let i = 0; i < inventory.size; i++) {
      //     const item = inventory.getItem(i);
      //     if (item) {
      //         const enchantComponent = item.getComponent("minecraft:enchantable");
      //         if (enchantComponent && enchantComponent.getEnchantments().length > 0) {
      //             itemsSnapshot.set(i, {
      //                 typeId: item.typeId,
      //                 enchantments: enchantComponent.getEnchantments()
      //             });
      //         }
      //     }
      // }
      // // Save the session with the location of the block and the item snapshot
      // activeRepairSessions.set(player.id, {
      //     blockLocation: block.location,
      //     snapshot: itemsSnapshot
      // });
  }
}

// 1. Register the custom component for your repair bench block
system.beforeEvents.startup.subscribe((init) => {
    init.blockComponentRegistry.registerCustomComponent("wsp:repair_tracker",RepairTracker);
});

// 2. A continuous tick monitor running every 4 ticks (~0.2 seconds) to watch active users
system.runInterval(() => {
  for (const [playerId, session] of activeRepairSessions.entries()) {
        const player = world.getEntity(playerId);
        // If the player left the game or walked away from the workbench, close the session
        if (!player || diffLoc(player.location,session.blockLocation) > 7.5) {
            activeRepairSessions.delete(playerId);
            continue;
        }
        const inventory = player.getComponent("minecraft:inventory").container;

        // Scan the inventory slots to check if a previously enchanted item was replaced by an unenchanted one
        for (const [slotIndex, cachedItem] of session.snapshot.entries()) {
            const currentItem = inventory.getItem(slotIndex);
            console.log(`${currentItem.typeId} ${cachedItem.typeId}`)
            // Condition: The item type is the same, but its enchantments are completely stripped (Vanilla repair logic)
            if (currentItem && currentItem.typeId === cachedItem.typeId) {
                const currentEnchantComp = currentItem.getComponent("minecraft:enchantable");

                if (currentEnchantComp && currentEnchantComp.getEnchantments().length === 0) {
                    // Reapply the stored enchantments back to the item
                    currentEnchantComp.addEnchantments(cachedItem.enchantments);
                    inventory.setItem(slotIndex, currentItem);

                    // Update our snapshot to reflect the item is safely restored
                    session.snapshot.delete(slotIndex);
                }
            } 
            // If the item in that slot changed completely or was emptied, clear it from snapshot tracking
            else if (!currentItem || currentItem.typeId !== cachedItem.typeId) {
                session.snapshot.delete(slotIndex);
            }
        }
    }
}, 4);



function openRepairMenu(player) {
    const inventory = player.getComponent("minecraft:inventory").container;
    const repairableItems = [];

    // 1. Gather items that have durability AND belong strictly to the "wsp:" namespace
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && item.typeId.startsWith("wsp:") && item.getComponent("minecraft:durability")) {
            repairableItems.push({ item, slot: i });
        }
    }

    if (repairableItems.length < 2) {
        // Fallback message using localizable rawtext
        player.sendMessage({ translate: "commands.wsp.repair.not_enough_items" });
        return;
    }

    // 2. First UI Screen: Select Primary Tool
    const firstToolForm = new ActionFormData()
        .title({ translate: "wsp.repair.title.primary" })
        .body({ translate: "wsp.repair.body.primary" });

    // Use rawtext for every button so Minecraft handles the language translation
    repairableItems.forEach(({ item, slot }) => {
        firstToolForm.button({
            rawtext: [
                { translate: `item.${item.typeId}` },
                { translate: `wsp.word.item.slot` },
                { text: `: ${slot+1}`}
            ]
        });
    });

    firstToolForm.show(player).then((response) => {
        if (response.canceled || response.selection === undefined) return;
        const primarySelection = repairableItems[response.selection];
        console.log(`primary: ${JSON.stringify(primarySelection)}`)
        // Filter inventory for a matching sacrificial item of the exact same type
        const secondaryMatches = repairableItems.filter(
          ({ slot, item }) => slot !== primarySelection.slot && item.typeId === primarySelection.item.typeId
        );
        console.log(`secondary: ${JSON.stringify(secondaryMatches)}`)

        if (secondaryMatches.length === 0) {
            player.sendMessage({ translate: "commands.wsp.repair.no_match" });
            return;
        }
        // 3. Second UI Screen: Select Sacrificial Tool
        const secondToolForm = new ActionFormData()
            .title({ translate: "wsp.repair.title.sacrificial" })
            .body({ translate: "wsp.repair.body.sacrificial" });

        secondaryMatches.forEach(({ item }) => {
            secondToolForm.button({
                rawtext: [
                    { translate: `item.${item.typeId}` }
                ]
            });
        });
        system.runTimeout(()=>{

        
        secondToolForm.show(player).then((secResponse) => {
          if (secResponse.canceled || secResponse.selection === undefined) return;
            const secondarySelection = secondaryMatches[secResponse.selection];
            console.log("didnt return")

            processRepair(player, primarySelection.slot, secondarySelection.slot);
        });

        },10);
    });
}

function processRepair(player, primarySlot, secondarySlot) {
    const inventory = player.getComponent("minecraft:inventory").container;
    
    const toolA = inventory.getItem(primarySlot);
    const toolB = inventory.getItem(secondarySlot);

    if (!toolA || !toolB) return;

    const durabilityA = toolA.getComponent("minecraft:durability");
    const durabilityB = toolB.getComponent("minecraft:durability");
    const enchantableA = toolA.getComponent("minecraft:enchantable");
    const enchantableB = toolB.getComponent("minecraft:enchantable");

    const maxDurability = durabilityA.maxDurability;
    const currentUsesA = maxDurability - durabilityA.damage;
    const currentUsesB = maxDurability - durabilityB.damage;
    const bonusDurability = Math.floor(maxDurability * 0.05);
    
    const combinedUses = Math.min(currentUsesA + currentUsesB + bonusDurability, maxDurability);
    const targetDamage = maxDurability - combinedUses;

    const finalItem = toolA.clone();
    finalItem.getComponent("minecraft:durability").damage = targetDamage;

    const finalEnchantComp = finalItem.getComponent("minecraft:enchantable");
    if (finalEnchantComp) {
        const mergedEnchantments = [];
        const enchantsA = enchantableA ? enchantableA.getEnchantments() : [];
        const enchantsB = enchantableB ? enchantableB.getEnchantments() : [];

        enchantsA.forEach((e) => mergedEnchantments.push(e));

        enchantsB.forEach((enchantB) => {
            const matchIndex = mergedEnchantments.findIndex((e) => e.type.id === enchantB.type.id);
            if (matchIndex === -1) {
                mergedEnchantments.push(enchantB);
            } else {
                const enchantA = mergedEnchantments[matchIndex];
                if (enchantB.level > enchantA.level) {
                    enchantA.level = enchantB.level;
                } else if (enchantB.level === enchantA.level && enchantA.level < enchantB.type.maxLevel) {
                    enchantA.level += 1;
                }
            }
        });

        finalEnchantComp.removeAllEnchantments();
        finalEnchantComp.addEnchantments(mergedEnchantments);
    }

    inventory.setItem(primarySlot, finalItem);
    inventory.setItem(secondarySlot, undefined);

    player.sendMessage({ translate: "commands.wsp.repair.success" });
    player.playSound("random.anvil_use");
}



// world.beforeEvents.worldInitialize.subscribe((initEvent) => {
//     initEvent.blockComponentRegistry.registerCustomComponent("wsp:open_repair_ui", {
//         onPlayerInteract: (event) => {
//             const { player } = event;
//             if (!player) return;
            
//             openRepairMenu(player);
//         }
//     });
// });
/*
function openRepairMenu(player) {
    const inventory = player.getComponent("minecraft:inventory").container;
    const repairableItems = [];

    // 1. Gather all items in the player's inventory that can be repaired or enchanted
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item) console.log(item.nameTag)
        if (item && item.getComponent("minecraft:durability")) {
            repairableItems.push({ item, slot: i });
        }
    }

    if (repairableItems.length < 2) {
        player.sendMessage("§cYou need at least two repairable tools or items in your inventory!");
        return;
    }

    // 2. First UI Screen: Select Tool #1 (The main item to keep/repair)
    const firstToolForm = new ActionFormData()
        .title("Repair Bench - Select Primary Tool")
        .body("Choose the main tool you want to repair and keep enchantments on:");

    repairableItems.forEach(({ item }) => {
        // firstToolForm.button(`${item.typeId.replace("minecraft:", "").replace("_", " ").toUpperCase()}`);
        firstToolForm.button(`${item.typeId.replace("minecraft:", "").replace("_", " ").toUpperCase()}`);
    });

    firstToolForm.show(player).then((response) => {
        if (response.canceled) return;
        const primarySelection = repairableItems[response.selection];

        // 3. Second UI Screen: Select Tool #2 (The sacrificial material item)
        const secondToolForm = new ActionFormData()
            .title("Repair Bench - Select Sacrificial Tool")
            .body("Choose an identical item type to consume for parts:");

        // Filter inventory again to find items matching the primary item's exact type ID (excluding the primary tool slot itself)
        const secondaryMatches = repairableItems.filter(
            ({ slot, item }) => slot !== primarySelection.slot && item.typeId === primarySelection.item.typeId
        );

        if (secondaryMatches.length === 0) {
            player.sendMessage("§cYou don't have a matching tool of the same type to combine!");
            return;
        }

        secondaryMatches.forEach(({ item }) => {
            secondToolForm.button(`${item.typeId.replace("minecraft:", "").replace("_", " ").toUpperCase()}`);
        });

        secondToolForm.show(player).then((secResponse) => {
            if (secResponse.canceled) return;
            const secondarySelection = secondaryMatches[secResponse.selection];

            // Execute the repair logic
            processRepair(player, primarySelection.slot, secondarySelection.slot);
        });
    });
}

function processRepair(player, primarySlot, secondarySlot) {
    const inventory = player.getComponent("minecraft:inventory").container;
    
    const toolA = inventory.getItem(primarySlot);
    const toolB = inventory.getItem(secondarySlot);

    if (!toolA || !toolB) return;

    const durabilityA = toolA.getComponent("minecraft:durability");
    const durabilityB = toolB.getComponent("minecraft:durability");
    const enchantableA = toolA.getComponent("minecraft:enchantable");
    const enchantableB = toolB.getComponent("minecraft:enchantable");

    // 1. Calculate Durability: Combine remaining uses plus vanilla 5% bonus
    const maxDurability = durabilityA.maxDurability;
    const currentUsesA = maxDurability - durabilityA.damage;
    const currentUsesB = maxDurability - durabilityB.damage;
    const bonusDurability = Math.floor(maxDurability * 0.05);
    
    const combinedUses = Math.min(currentUsesA + currentUsesB + bonusDurability, maxDurability);
    const targetDamage = maxDurability - combinedUses;

    // 2. Clone primary item to serve as final output modification template
    const finalItem = toolA.clone();
    finalItem.getComponent("minecraft:durability").damage = targetDamage;

    // 3. Merge Enchantments cleanly
    const finalEnchantComp = finalItem.getComponent("minecraft:enchantable");
    if (finalEnchantComp) {
        const mergedEnchantments = [];
        const enchantsA = enchantableA ? enchantableA.getEnchantments() : [];
        const enchantsB = enchantableB ? enchantableB.getEnchantments() : [];

        // Seed list with original Tool A enchantments
        enchantsA.forEach((e) => mergedEnchantments.push(e));

        // Attempt to merge or upgrade from Sacrificial Tool B
        enchantsB.forEach((enchantB) => {
            const matchIndex = mergedEnchantments.findIndex((e) => e.type.id === enchantB.type.id);
            if (matchIndex === -1) {
                mergedEnchantments.push(enchantB);
            } else {
                const enchantA = mergedEnchantments[matchIndex];
                if (enchantB.level > enchantA.level) {
                    enchantA.level = enchantB.level; // Tool B had a higher tier
                } else if (enchantB.level === enchantA.level && enchantA.level < enchantB.type.maxLevel) {
                    enchantA.level += 1; // Combine matching tiers to upgrade (e.g. Sharpness IV + IV = V)
                }
            }
        });

        // Clear any old instances and write fresh merged data
        finalEnchantComp.removeAllEnchantments();
        finalEnchantComp.addEnchantments(mergedEnchantments);
    }

    // 4. Update the player inventory slots safely
    inventory.setItem(primarySlot, finalItem);
    inventory.setItem(secondarySlot, undefined); // Deletes the consumed sacrificial material tool

    player.sendMessage("§aTool successfully repaired and enchantments merged!");
    player.playSound("random.anvil_use");
}
*/