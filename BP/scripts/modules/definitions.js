import { world } from "@minecraft/server";
import * as f from "modules/bow_functions.js"

export const eventTypes = Object.freeze({
  RELEASE: 'release',
  BLOCK: 'block',
  ENTITY: 'entity'
})

/**
 * Represents a type of bow.
 * @class
 */
export class bowType {
  /**
   * @param {string} id 
   * @param {string} sound
   * @param {float 0.0-1.0} sound
   * @param {eventTypes} eventType 
   * @param {Function} func
   * @param {eventTypes} eventType2
   * @param {Function} func2
   * @param {eventTypes} eventType3
   * @param {Function} func3
   */
  constructor(id,sound,sound_volume=0.5,eventType,func,eventType2=null,func2=null,eventType3=null,func3=null){
    this.id = id;
    this.sound = sound ?? ''
    this.sound_volume = sound_volume ?? 0
    this.name = id.slice(4,-4).toUpperCase();
    this.eventType = eventType;
    this.eventFunc = func;
    this.eventType2 = eventType2;
    this.eventFunc2 = func2;
    this.eventType3 = eventType3;
    this.eventFunc3 = func3;
  }

  log(){
    world.sendMessage(`${this.name}\n${this.id}\n${this.eventType}`)
  }
  checkIfEvent(event){
    if (event === this.eventType){
      return true
    }
    return false;
  }
  checkIfEvent2(event){
    if (event === this.eventType2){
      return true
    }
    return false;
  }
  checkIfEvent3(event){
    if (event === this.eventType3){
      return true
    }
    return false;
  }
  run(eventT, event){
    if (this.checkIfEvent(eventT)){
        this.eventFunc(event)
    } else if (this.checkIfEvent2(eventT)) {  
        this.eventFunc2(event)
    } else if (this.checkIfEvent3(eventT)) {  
        this.eventFunc3(event)
    } else {
        return false;
    }
    return true;
  }
  playSound(dimension,location){
    let pitch = Math.random() * (1.2 - 0.8) + 0.8;
    dimension.playSound(this.sound,{"x":location.x,"y":location.y+1.25,"z":location.z},{"volume":this.sound_volume,"pitch":pitch})
  }
  
}



export const SOUL = "wsp:soul"
export const SOUL_HARVESTER = "wsp:soul_harvester"
export const FLETCH = "wsp:mob_fletcher"
export const FORGE = "wsp:mob_forge"
export const STACKED = "wsp:stacked_bow"

export const BLAZE = "wsp:blaze_bow"
export const BOGGED = "wsp:bogged_bow"
export const BREEZE = "wsp:breeze_bow"
export const CREAKING = "wsp:creaking_bow"
export const CREEPER = "wsp:creeper_bow"
export const ELDER = "wsp:elder_guardian_bow"
export const ENDERDRAGON = "wsp:ender_dragon_bow"
export const ENDERMITE = "wsp:endermite_bow"
export const EVOKER = "wsp:evoker_bow"
export const GHAST = "wsp:ghast_bow"
export const GUARDIAN = "wsp:guardian_bow"
export const HOGLIN = "wsp:hoglin_bow"
export const HUSK = "wsp:husk_bow"
export const MAGMA = "wsp:magma_bow"
export const PARCHED = "wsp:parched_bow"
export const PHANTOM = "wsp:phantom_bow"
export const PIGLIN = "wsp:piglin_brute_bow"
export const PILLAGER = "wsp:pillager_bow"
export const RAVAGER = "wsp:ravager_bow"
export const SHULKER = "wsp:shulker_bow"
export const SILVERFISH = "wsp:silverfish_bow"
export const SKELETON = "wsp:skeleton_bow"
export const SLIME = "wsp:slime_bow"
export const STRAY = "wsp:stray_bow"
export const SULFUR = "wsp:sulfur_bow"
export const VEX = "wsp:vex_bow"
export const VINDICATOR = "wsp:vindicator_bow"
export const WARDEN = "wsp:warden_bow"
export const WITCH = "wsp:witch_bow"
export const WITHER = "wsp:wither_bow"
export const WITHERSKELL = "wsp:wither_skeleton_bow"
export const ZOGLIN = "wsp:zoglin_bow"
export const ZOMBIE = "wsp:zombie_bow"
export const ZOMBIEVILL = "wsp:zombie_villager_bow"

export const ALTERNATIVE_RECIPES = {
  [BLAZE]: "minecraft:blaze_rod",
  [BOGGED]: "minecraft:brown_mushroom",
  [BREEZE]: "minecraft:breeze_rod",
  [CREAKING]: "minecraft:pale_oak_log",
  [CREEPER]: "minecraft:gunpowder",
  [ELDER]: "minecraft:prismarine_crystals",
  [ENDERDRAGON]: "minecraft:dragon_breath",
  [ENDERMITE]: "minecraft:chorus_fruit",
  [EVOKER]: "minecraft:totem_of_undying",
  [GHAST]: "minecraft:ghast_tear",
  [GUARDIAN]: "minecraft:prismarine_shard",
  [HOGLIN]: "minecraft:leather",
  [HUSK]: "minecraft:rotten_flesh",
  [MAGMA]: "minecraft:magma_cream",
  [PARCHED]: "minecraft:dried_kelp",
  [PHANTOM]: "minecraft:phantom_membrane",
  [PIGLIN]: "minecraft:netherite_scrap",
  [PILLAGER]: "minecraft:iron_ingot",
  [RAVAGER]: "minecraft:iron_block",
  [SHULKER]: "minecraft:shulker_shell",
  [SILVERFISH]: "minecraft:infested_stone",
  [SKELETON]: "minecraft:bone",
  [SLIME]: "minecraft:slime_ball",
  [STRAY]: "minecraft:packed_ice",
  [SULFUR]: "minecraft:potent_sulfur",
  [VEX]: "minecraft:iron_sword",
  [VINDICATOR]: "minecraft:emerald",
  [WARDEN]: "minecraft:echo_shard",
  [WITCH]: "minecraft:redstone",
  [WITHER]: "minecraft:wither_rose",
  [WITHERSKELL]: "minecraft:wither_skeleton_skull",
  [ZOGLIN]: "minecraft:gold_block",
  [ZOMBIE]: "minecraft:rotten_flesh",
  [ZOMBIEVILL]: "minecraft:golden_apple"
};

export const LANG={
  "en_US":{
    title:"Mob Bows Guide"
  },
  "id_ID":{
    title:""
  },
  "da_DK":{
    title:""
  },
  "de_DE":{
    title:""
  },
  "en_GB":{
    title:""
  },
  "es_ES":{
    title:""
  },
  "es_MX":{
    title:""
  },
  "fr_CA":{
    title:""
  },
  "fr_FR":{
    title:""
  },
  "it_IT":{
    title:""
  },
  "hu_HU":{
    title:""
  },
  "nl_NL":{
    title:""
  },
  "nb_NO":{
    title:""
  },
  "pl_PL":{
    title:""
  },
  "pt_BR":{
    title:""
  },
  "pt_PT":{
    title:""
  },
  "sk_SK":{
    title:""
  },
  "fi_FI":{
    title:""
  },
  "sv_SE":{
    title:""
  },
  "tr_TR":{
    title:""
  },
  "cs_CZ":{
    title:""
  },
  "el_GR":{
    title:""
  },
  "bg_BG":{
    title:""
  },
  "ru_RU":{
    title:""
  },
  "uk_UA":{
    title:""
  },
  "ja_JP":{
    title:""
  },
  "zh_CN":{
    title:""
  },
  "zh_TW":{
    title:""
  },
  "ko_KR":{
    title:""
  },
}


export const allBows={
  [BLAZE]: new bowType(BLAZE,"mob.blaze.shoot",0.2,eventTypes.ENTITY,f.blaze_entity,eventTypes.BLOCK,f.blaze_block),
  [BOGGED]: new bowType(BOGGED,"mob.bogged.step",0.55,eventTypes.ENTITY,f.bogged),
  [BREEZE]: new bowType(BREEZE,"mob.breeze.shoot",0.2,eventTypes.ENTITY,f.breeze),
  [CREAKING]: new bowType(CREAKING,"mob.creaking.attack",0.3,eventTypes.ENTITY,f.creaking),
  [CREEPER]: new bowType(CREEPER,"random.fuse",10,eventTypes.ENTITY,f.creeper_entity,eventTypes.BLOCK,f.creeper_block),
  [ELDER]: new bowType(ELDER,"mob.elderguardian.curse",0.15,eventTypes.ENTITY,f.elder_guardian,eventTypes.RELEASE,f.elder_guardian_release),
  [ENDERDRAGON]: new bowType(ENDERDRAGON,"mob.enderdragon.growl",0.04,eventTypes.ENTITY,f.ender_dragon_entity,eventTypes.BLOCK,f.ender_dragon_block),
  [ENDERMITE]: new bowType(ENDERMITE,"mob.endermite.say",0.5,eventTypes.ENTITY,f.endermite),
  [EVOKER]: new bowType(EVOKER,"mob.evocation_illager.cast_spell",1,eventTypes.ENTITY,f.evoker_entity,eventTypes.BLOCK,f.evoker_block),
  [GHAST]: new bowType(GHAST,"mob.ghast.fireball",0.2,eventTypes.ENTITY,f.ghast_entity,eventTypes.BLOCK,f.ghast_block),
  [GUARDIAN]: new bowType(GUARDIAN,"mob.guardian.death",1,eventTypes.ENTITY,f.guardian_entity,eventTypes.BLOCK,f.guardian_block,eventTypes.RELEASE,f.guardian_release),
  [HOGLIN]: new bowType(HOGLIN,"mob.hoglin.angry",0.2,eventTypes.ENTITY,f.hoglin),
  [HUSK]: new bowType(HUSK,"mob.husk.ambient",0.6,eventTypes.ENTITY,f.husk),
  [MAGMA]: new bowType(MAGMA,"mob.slime.big",0.6,eventTypes.RELEASE,f.magma_release,eventTypes.BLOCK,f.magma_block),
  [PARCHED]: new bowType(PARCHED,"mob.parched.step",0.55,eventTypes.ENTITY,f.parched),
  [PHANTOM]: new bowType(PHANTOM,"mob.phantom.bite",0.1,eventTypes.RELEASE,f.phantom_release),
  [PIGLIN]: new bowType(PIGLIN,"mob.piglin_brute.ambient",0.3,eventTypes.ENTITY,f.piglin_brute,eventTypes.RELEASE,f.piglin_brute_release),
  [PILLAGER]: new bowType(PILLAGER,"mob.pillager.idle",0.1),
  [RAVAGER]: new bowType(RAVAGER,"mob.ravager.roar",0.2,eventTypes.ENTITY,f.ravager),
  [SHULKER]: new bowType(SHULKER,"mob.shulker.shoot",0.6,eventTypes.RELEASE,f.shulker_release,eventTypes.ENTITY,f.shulker,eventTypes.BLOCK,f.shulker_block),
  [SILVERFISH]: new bowType(SILVERFISH,"mob.silverfish.say",0.5,eventTypes.RELEASE,f.silverfish,eventTypes.BLOCK,f.silverfish_block,eventTypes.ENTITY,f.silverfish_entity),
  [SKELETON]: new bowType(SKELETON,"mob.skeleton.step",0.5,eventTypes.ENTITY,f.skeleton),
  [SLIME]: new bowType(SLIME,"mob.slime.big",0.6,eventTypes.RELEASE,f.slime_release),
  [STRAY]: new bowType(STRAY,"mob.stray.step",0.8,eventTypes.ENTITY,f.stray),
  [SULFUR]: new bowType(SULFUR,"block.potent_sulfur.ambient",100,eventTypes.ENTITY,f.sulfur_entity,eventTypes.BLOCK,f.sulfur_block),
  [VEX]: new bowType(VEX,"mob.vex.hurt",1,eventTypes.RELEASE,f.vex_release),
  [VINDICATOR]: new bowType(VINDICATOR,"mob.vindicator.idle",0.3,eventTypes.ENTITY,f.vindicator),
  [WARDEN]: new bowType(WARDEN,"mob.warden.sonic_boom",600,eventTypes.BLOCK,f.warden_block,eventTypes.RELEASE,f.warden_release),
  [WITCH]: new bowType(WITCH,"mob.witch.throw",0.3,eventTypes.ENTITY,f.witch),
  [WITHER]: new bowType(WITHER,"mob.wither.shoot",0.3,eventTypes.ENTITY,f.wither,eventTypes.BLOCK,f.wither_block,eventTypes.RELEASE,f.wither_release),
  [WITHERSKELL]: new bowType(WITHERSKELL,"entity.wither_skeleton.step",0.6,eventTypes.ENTITY,f.wither_skeleton),
  [ZOGLIN]: new bowType(ZOGLIN,"mob.zoglin.angry",0.3,eventTypes.ENTITY,f.zoglin),
  [ZOMBIE]: new bowType(ZOMBIE,"mob.zombie.say",0.3,eventTypes.ENTITY,f.zombie),
  [ZOMBIEVILL]: new bowType(ZOMBIEVILL,"mob.zombie_villager.say",0.3,eventTypes.ENTITY,f.zombie_villager),
}