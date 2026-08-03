execute at @e[type=arrow,tag=shulker] run particle minecraft:shulker_bullet ~~~
execute at @e[type=arrow,tag=wither] run particle minecraft:basic_smoke_particle ~~~
execute at @e[type=arrow,tag=piglin_brute] run particle minecraft:falling_border_dust_particle ~~-0.5~
# execute at @e[type=arrow,tag=guardian] run particle minecraft:water_splash_particle_manual ~~-0.7~
execute at @e[type=arrow,tag=guardian] run particle minecraft:guardian_attack_particle ~~~
execute at @e[type=arrow,tag=warden] run particle minecraft:sonic_explosion ~~~
execute at @e[type=arrow,tag=warden] run damage @e[type=!arrow,r=2] 22 magic entity @p

execute at @a[tag=zoglin] run particle wsp:zoglin ~~~
tag @a[tag=zoglin] remove zoglin

execute at @e[type=arrow,tag=magma] run fill ~~~ ~~-10~ fire replace air 
scoreboard objectives add slimelife dummy
scoreboard objectives add slimedamage dummy
scoreboard players add @e[type=wsp:slimeball] slimelife 1
execute at @e[type=wsp:slimeball] run scoreboard players add @e[type=!wsp:slimeball,r=2] slimedamage 1
# scoreboard players set @e[scores={slimedamage=1..},type=wsp:slimeball] slimelife 100
execute at @e[scores={slimedamage=1..}] run scoreboard players set @e[type=wsp:slimeball,r=2] slimelife 100 
damage @e[type=!wsp:slimeball,scores={slimedamage=1..}] 4 projectile
scoreboard players reset @e[scores={slimedamage=1..}] slimedamage
execute as @e[type=wsp:slimeball,scores={slimelife=100..}] at @s run tp @s ~ -65 ~
kill @e[type=wsp:slimeball,scores={slimelife=105..}]