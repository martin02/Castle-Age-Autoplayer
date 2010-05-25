/********** Worker.Monster **********
 * Automates Monster
 */
var Monster = new Worker('Monster');
Monster.data = {};

Monster.defaults = {
    castle_age:{
        pages:'keep_monster keep_monster_active keep_monster_active2 battle_raid'
    }
};

Monster.option = {
    fortify: 80,
    //	dispel: 50,
    fortify_active:false,
    choice: 'Any',
    ignore_stats:true,
    stop: 'Never',
    own: true,
    armyratio: 1,
    levelratio: 'Any',
    force1: true,
    raid: 'Invade x5',
    assist: true,
    maxstamina: 5,
    minstamina: 5,
    maxenergy: 10,
    minenergy: 10,
    monster_check:'Hourly',
    check_interval:3600000,
    avoid_behind:false,
    avoid_hours:5,
    behind_override:false
};

Monster.runtime = {
    check:false, // got monster pages to visit and parse
    uid:null,
    type:null,
    fortify:false, // true if we can fortify / defend / etc
    attack:false, // true to attack
    stamina:5, // stamina to burn
    health:10 // minimum health to attack
};

Monster.display = [
{
    title:'Fortification'
},{
    id:'fortify',
    label:'Fortify Below',
    select:[10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    after:'%'
},{
    id:'fortify_active',
    label:'Fortify Active',
    checkbox:true,
    help:'Must be checked to fortify.'
},{
    title:'Who To Fight'
},{
    advanced:true,
    id:'ignore_stats',
    label:'Ignore Player Stats',
    checkbox:true,
    help:'Do not use the current health or stamina as criteria for choosing monsters.'
},{
    id:'choice',
    label:'Attack',
    select:['Any', 'Strongest', 'Weakest', 'Shortest ETD', 'Longest ETD', 'Spread', 'Max Damage', 'Mim Damage','ETD Maintain']
},{
    id:'stop',
    label:'Stop',
    select:['Never', 'Achievement', 'Loot'],
    help:'Select when to stop attacking a target.'
},{
    id:'maxstamina',
    label:'Max Stamina Cost',
    select:[1,5,10,20,50],
    help:'Select the maximum stamina for a single attack'
},{
    id:'minstamina',
    label:'Min Stamina Cost',
    select:[1,5,10,20,50],
    help:'Select the minimum stamina for a single attack'
},{
    id:'maxenergy',
    label:'Max Energy Cost',
    select:[10,20,40,100],
    help:'Select the maximum energy for a single energy action'
},{
    id:'minenergy',
    label:'Min Energy Cost',
    select:[10,20,40,100],
    help:'Select the minimum energy for a single energy action'
},{
    advanced:true,
    id:'own',
    label:'Never stop on Your Monsters',
    checkbox:true,
    help:'Never stop attacking your own summoned monsters (Ignores Stop option).'
},{
    advanced:true,
    id:'avoid_behind',
    label:'Avoid Upside-Down Monsters',
    checkbox:true,
    help:'Avoid Monsters that behind in ETD as compared to CA Timer.'
},{
    advanced:true,
    id:'avoid_hours',
    label:'Upside-Down Hours',
    select:[0,1,5,10,15,25,50],
    help:'# of Hours Monster must be behind before preventing attacks.'
},{
    advanced:true,
    id:'behind_override',
    label:'Stop Override',
    checkbox:true,
    help:'Continue attacking monsters that meet Stop option but are upside-down (Kill In greater than Time Left). Attempts to bring Kill In below Time Left if damage is at or above Stop Option. Works in coordination with Avoid Upside-Down Monsters)'
},{
    title:'Raids'
},{
    id:'raid',
    label:'Raid',
    select:['Invade', 'Invade x5', 'Duel', 'Duel x5']
},{
    id:'armyratio',
    label:'Target Army Ratio<br>(Only needed for Invade)',
    select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
    help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
},{
    id:'levelratio',
    label:'Target Level Ratio<br>(Mainly used for Duel)',
    select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
    help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
},{
    id:'force1',
    label:'Force +1',
    checkbox:true,
    help:'Force the first player in the list to aid.'
},{
    title:'Siege Assist Options'
},{
    id:'assist',
    label:'Assist with Sieges',
    help:'Spend stamina to assist with sieges.',
    checkbox:true
},{
    id:'assist_links',
    label:'Use Assist Links in Dashboard',
    checkbox:true
},{
    advanced:true,
    id:'monster_check',
    label:'Monster Review',
    select:['Quarterly','1/2 Hour','Hourly','2 Hours','6 Hours','12 Hours','Daily','Weekly'],
    help:'Sets how ofter to check Monster Stats.'
}
];

Monster.types = {
    // Special (level 5) - not under Monster tab
    //	kull: {
    //		name:'Kull, the Orc Captain',
    //		timer:259200 // 72 hours
    //	},
    // Raid

    raid_easy: {
        name:'The Deathrune Siege',
        list:'deathrune_list1.jpg',
        image:'raid_title_raid_a1.jpg',
        image2:'raid_title_raid_a2.jpg',
        dead:'raid_1_large_victory.jpg',
        achievement:100,
        timer:216000, // 60 hours
        timer2:302400, // 84 hours
        raid:true
    },

    raid: {
        name:'The Deathrune Siege',
        list:'deathrune_list2.jpg',
        image:'raid_title_raid_b1.jpg',
        image2:'raid_title_raid_b2.jpg',
        dead:'raid_1_large_victory.jpg',
        achievement:100,
        timer:319920, // 88 hours, 52 minutes
        timer2:519960, // 144 hours, 26 minutes
        raid:true
    },
    // Epic Boss
    colossus: {
        name:'Colossus of Terra',
        list:'stone_giant_list.jpg',
        image:'stone_giant_large.jpg',
        dead:'stone_giant_dead.jpg',
        achievement:20000,
        timer:259200, // 72 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    gildamesh: {
        name:'Gildamesh, the Orc King',
        list:'orc_boss_list.jpg',
        image:'orc_boss.jpg',
        dead:'orc_boss_dead.jpg',
        achievement:15000,
        timer:259200, // 72 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    keira: {
        name:'Keira the Dread Knight',
        list:'boss_keira_list.jpg',
        image:'boss_keira.jpg',
        dead:'boss_keira_dead.jpg',
        achievement:30000,
        timer:172800, // 48 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    lotus: {
        name:'Lotus Ravenmoore',
        list:'boss_lotus_list.jpg',
        image:'boss_lotus.jpg',
        dead:'boss_lotus_big_dead.jpg',
        achievement:500000,
        timer:172800, // 48 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    mephistopheles: {
        name:'Mephistopheles',
        list:'boss_mephistopheles_list.jpg',
        image:'boss_mephistopheles_large.jpg',
        dead:'boss_mephistopheles_dead.jpg',
        achievement:100000,
        timer:172800, // 48 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    skaar: {
        name:'Skaar Deathrune',
        list:'death_list.jpg',
        image:'death_large.jpg',
        dead:'death_dead.jpg',
        achievement:1000000,
        timer:345000, // 95 hours, 50 minutes
        mpool:1,
        atk_btn:'input[name="Attack Dragon"][src*="attack"]',
        attacks:[1,5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="dispel"]',
        defends:[10,20,40,100]
    },
    sylvanus: {
        name:'Sylvana the Sorceress Queen',
        list:'boss_sylvanus_list.jpg',
        image:'boss_sylvanus_large.jpg',
        dead:'boss_sylvanus_dead.jpg',
        achievement:50000,
        timer:172800, // 48 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    // Epic Team
    dragon_emerald: {
        name:'Emerald Dragon',
        list:'dragon_list_green.jpg',
        image:'dragon_monster_green.jpg',
        dead:'dead_dragon_image_green.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    dragon_frost: {
        name:'Frost Dragon',
        list:'dragon_list_blue.jpg',
        image:'dragon_monster_blue.jpg',
        dead:'dead_dragon_image_blue.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    dragon_gold: {
        name:'Gold Dragon',
        list:'dragon_list_yellow.jpg',
        image:'dragon_monster_gold.jpg',
        dead:'dead_dragon_image_gold.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    dragon_red: {
        name:'Ancient Red Dragon',
        list:'dragon_list_red.jpg',
        image:'dragon_monster_red.jpg',
        dead:'dead_dragon_image_red.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    serpent_amethyst: { // DEAD image Verified and enabled.
        name:'Amethyst Sea Serpent',
        list:'seamonster_list_purple.jpg',
        image:'seamonster_purple.jpg',
        dead:'seamonster_dead.jpg',
        title:'seamonster_title_amethyst.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5],
        def_btn:'input[name="Defend against Monster"]',
        defends:[10]
    },
    serpent_ancient: { // DEAD image Verified and enabled.
        name:'Ancient Sea Serpent',
        list:'seamonster_list_red.jpg',
        image:'seamonster_red.jpg',
        dead:'seamonster_dead.jpg',
        title:'seamonster_title_ancient.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5],
        def_btn:'input[name="Defend against Monster"]',
        defends:[10]
    },
    serpent_emerald: { // DEAD image Verified and enabled.
        name:'Emerald Sea Serpent',
        list:'seamonster_list_green.jpg',
        image:'seamonster_green.jpg',
        dead:'seamonster_dead.jpg',
        title:'seamonster_title_emerald.jpg', //Guesswork. Needs verify.
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5],
        def_btn:'input[name="Defend against Monster"]',
        defends:[10]
    },
    serpent_sapphire: { // DEAD image guesswork based on others and enabled.
        name:'Sapphire Sea Serpent',
        list:'seamonster_list_blue.jpg',
        image:'seamonster_blue.jpg',
        dead:'seamonster_dead.jpg',
        title:'seamonster_title_sapphire.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5],
        def_btn:'input[name="Defend against Monster"]',
        defends:[10]
    },
    // Epic World
    cronus: {
        name:'Cronus, The World Hydra',
        list:'hydra_head.jpg',
        image:'hydra_large.jpg',
        dead:'hydra_dead.jpg',
        achievement:500000,
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    legion: {
        name:'Battle of the Dark Legion',
        list:'castle_siege_list.jpg',
        image:'castle_siege_large.jpg',
        dead:'castle_siege_dead.jpg',
        achievement:1000,
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="attack_monster_button2"]',
        attacks:[5],
        def_btn:'input[name="Attack Dragon"][src*="attack_monster_button3"]',
        defends:[10],
        orcs:true
    },
    genesis: {
        name:'Genesis, The Earth Elemental',
        list:'earth_element_list.jpg',
        image:'earth_element_large.jpg',
        dead:'earth_element_dead.jpg',
        achievement:1000000,
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="attack"]',
        attacks:[1,5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="fortify"]',
        defends:[10,20,40,100]
    },
    ragnarok: {
        name:'Ragnarok, The Ice Elemental',
        list:'water_list.jpg',
        image:'water_large.jpg',
        dead:'water_dead.jpg',
        achievement:1000000,
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="attack"]',
        attacks:[1,5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="dispel"]',
        defends:[10,20,40,100]
    },
    bahamut: {
        name:'Bahamut, the Volcanic Dragon',
        list:'nm_volcanic_list.jpg',
        image:'nm_volcanic_large.jpg',
        dead:'nm_volcanic_dead.jpg',
        achievement:1000000, // Guesswork
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
        attacks:[5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
        defends:[10,20,40,100]
    },
    alpha_bahamut: {
        name:'Alpha Bahamut, the Volcanic Dragon',
        list:'nm_volcanic_list_2.jpg',
        image:'nm_volcanic_large_2.jpg',
        dead:'nm_volcanic_dead_2.jpg', //Guesswork
        achievement:1000000, // Guesswork
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
        attacks:[5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
        defends:[10,20,40,100]
    }
};

Monster.secondary = ['input[src$="nm_secondary_cripple.jpg"]', 'input[src$="nm_secondary_deflect.jpg"]'];
Monster.health_img = ['img[src$="nm_red.jpg"]', 'img[src$="monster_health_background.jpg"]'];
Monster.shield_img = ['img[src$="bar_dispel.gif"]'];
Monster.defense_img = ['img[src$="nm_green.jpg"]', 'img[src$="seamonster_ship_health.jpg"]'];
Monster.secondary_img = ['img[src$="nm_stun_bar.gif"]'];
Monster.class_img = ['img[src$="nm_class_warrior.jpg"]', 'img[src$="nm_class_cleric.jpg"]', 'img[src$="nm_class_rogue.jpg"]', 'img[src$="nm_class_mage.jpg"]'];
Monster.class_name = ['Warrior', 'Cleric', 'Rogue', 'Mage'];

Monster.init = function() {
    var i, j;
    this.runtime.count = 0;
    for (i in this.data) {
        for (j in this.data[i]) {
            if (this.data[i][j].state === 'engage') {
                this.runtime.count++;
            }
            if (typeof this.data[i][j].ignore === 'unknown'){
                this.data[i][j].ignore = false;
            }
            if (typeof this.data[i][j].dispel !== 'undefined') {
                this.data[i][j].defense = 100 - this.data[i][j].dispel;
                delete this.data[i][j].dispel;
            }
        }
    }
    this._watch(Player);
    $('#golem-dashboard-Monster tbody td a').live('click', function(event){
        var url = $(this).attr('href');
        Page.to((url.indexOf('raid') > 0 ? 'battle_raid' : 'keep_monster'), url.substr(url.indexOf('?')));
        return false;
    });
}

Monster.parse = function(change) {
    var i, j, k, new_id, id_list = [], battle_list = Battle.get('user'), uid, type, tmp, $health, $defense, $dispel, $secondary, dead = false, monster, timer;
    var data = Monster.data, types = Monster.types;	//Is there a better way?  "this." doesn't seem to work.
    if (Page.page === 'keep_monster_active' || Page.page === 'keep_monster_active2') { // In a monster or raid
        uid = $('img[linked][size="square"]').attr('uid');
        for (i in types) {
            if (types[i].dead && $('img[src$="'+types[i].dead+'"]').length  && !types[i].title) {
                //debug(this.name,'Found a dead '+i);
                type = i;
                timer = types[i].timer;
                dead = true;
            } else if (types[i].dead && $('img[src$="'+types[i].dead+'"]').length && types[i].title && $('div[style*="'+types[i].title+'"]').length){
                //debug(this.name,'Found a dead '+i);
                type = i;
                timer = types[i].timer;
                dead = true;
            } else if (types[i].image && ($('img[src$="'+types[i].image+'"]').length || $('div[style*="'+types[i].image+'"]').length)) {
                //debug(this.name,'Parsing '+i);
                type = i;
                timer = types[i].timer;
            } else if (types[i].image2 && ($('img[src$="'+types[i].image2+'"]').length || $('div[style*="'+types[i].image2+'"]').length)) {
                //debug(this.name,'Parsing second stage '+i);
                type = i;
                timer = types[i].timer2 || types[i].timer;
            }
        }
        if (!uid || !type) {
            debug(this.name,'Unknown monster (probably dead)');
            return false;
        }
        data[uid] = data[uid] || {};
        data[uid][type] = data[uid][type] || {};
        monster = data[uid][type];
        monster.last = Date.now();
        if ($('input[src*="collect_reward_button.jpg"]').length) {
            monster.state = 'reward';
            return false;
        }
        if (dead && monster.state === 'assist') {
            monster.state = null;
        } else if (dead && monster.state === 'engage') {
            monster.state = 'reward';
        } else {
            if (!monster.state && $('span.result_body').text().match(/for your help in summoning|You have already assisted on this objective|You don't have enough stamina assist in summoning/i)) {
                if ($('span.result_body').text().match(/for your help in summoning/i)) {
                    monster.assist = Date.now();
                }
                monster.state = 'assist';
            }
            if ($('img[src$="battle_victory.gif"],img[src$="battle_defeat.gif"],span["result_body"] a:contains("Attack Again")').length)	{ //	img[src$="icon_weapon.gif"],
                monster.battle_count = (monster.battle_count || 0) + 1;
            //debug(this.name,'Setting battle count to ' + monster.battle_count);
            }
            if ($('img[src$="battle_victory"]').length){
                History.add('raid+win',1);
            }
            if ($('img[src$="battle_defeat"]').length){
                History.add('raid+loss',-1);
            }
            if (!monster.name) {
                tmp = $('img[linked][size="square"]').parent().parent().next().text().trim().replace(/[\s\n\r]{2,}/g, ' ');
                //				monster.name = tmp.substr(0, tmp.length - Monster.types[type].name.length - 3);
                monster.name = tmp.regex(/(.+)'s /i);
            }
            // Need to also parse what our class is for Bahamut.  (Can probably just look for the strengthen button to find warrior class.)
            for (i in Monster['class_img']){
                if ($(Monster['class_img'][i]).length){
                    monster.mclass = i;
                }
            }
            if (monster.mclass > 1){	// If we are a Rogue or Mage
                for (i in Monster['secondary_img']){
                    if ($(Monster['secondary_img'][i]).length){
                        $secondary = $(Monster['secondary_img'][i]);
                        monster.secondary = $secondary.length ? (100 * $secondary.width() / $secondary.parent().width()) : 0;
                    }
                }
            }
            for (i in Monster['health_img']){
                if ($(Monster['health_img'][i]).length){
                    $health = $(Monster['health_img'][i]).parent();
                    monster.health = $health.length ? (100 * $health.width() / $health.parent().width()) : 0;
                    break;
                }
            }
            for (i in Monster['shield_img']){
                if ($(Monster['shield_img'][i]).length){
                    $dispel = $(Monster['shield_img'][i]).parent();
                    monster.defense = 100 * (1 - ($dispel.width() / ($dispel.next().length ? $dispel.width() + $dispel.next().width() : $dispel.parent().width())));
                    monster.totaldefense = monster.defense * (isNumber(monster.strength) ? (monster.strength/100) : 1);
                    break;
                }
            }
            for (i in Monster['defense_img']){
                if ($(Monster['defense_img'][i]).length){
                    $defense = $(Monster['defense_img'][i]).parent();
                    monster.defense = ($defense.width() / ($defense.next().length ? $defense.width() + $defense.next().width() : $defense.parent().width()) * 100);
                    if ($defense.parent().width() < $defense.parent().parent().width()){
                        monster.strength = 100 * $defense.parent().width() / $defense.parent().parent().width();
                    }
                    monster.totaldefense = monster.defense * (isNumber(monster.strength) ? (monster.strength/100) : 1);
                    break;
                }
            }
            monster.timer = $('#app'+APPID+'_monsterTicker').text().parseTimer();
            monster.finish = Date.now() + (monster.timer * 1000);
            monster.damage_total = 0;
            monster.damage_siege = 0;
            monster.damage_players = 0;
            monster.fortify = 0;
            monster.damage = {};
            $('img[src*="siege_small"]').each(function(i,el){
                var siege = $(el).parent().next().next().next().children().eq(0).text();
                var tmp = $(el).parent().next().next().next().children().eq(1).text().replace(/[^0-9]/g,'');
                var dmg = tmp.regex(/([0-9]+)/);
                //debug('Monster Siege',siege + ' did ' + addCommas(dmg) + ' amount of damage.');
                monster.damage[siege]  = [dmg];
                monster.damage_siege += dmg;
            });
            $('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
                var user = $(el).attr('href').regex(/user=([0-9]+)/i);
                var tmp = null;
                if (types[type].raid){
                    tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,'');
                } else {
                    tmp = $(el).parent().parent().next().text().replace(/[^0-9\/]/g,'');
                }
                var dmg = tmp.regex(/([0-9]+)/), fort = tmp.regex(/\/([0-9]+)/);
                monster.damage[user]  = (fort ? [dmg, fort] : [dmg]);
                if (user === userID){
                    if (monster.battle_count && monster.damage_user){
                        monster.damage_avg = Math.ceil(monster.damage_user / monster.battle_count);
                    //debug('Monster Damage','(1) Setting Avg Damage to ' + monster.damage_avg);
                    } else {
                        monster.damage_avg = monster.damage_user;
                    //debug('Monster Damage','(2) Setting Avg Damage to ' + monster.damage_avg);
                    }
                    if ((monster.damage_avg > ((dmg - monster.damage_user) * 1.3)  || monster.damage_avg < ((dmg - monster.damage_user) * 1.3) )&& dmg !== monster.damage_user){
                        //debug('Monster Damage','Last Attack was ' + (dmg - monster.damage_user));
                        monster.damage_avg = Math.ceil(((dmg - monster.damage_user) + monster.damage_avg) /2);
                    //debug('Monster Damage','(3) Setting Avg Damage to ' + monster.damage_avg);
                    }
                    
                    monster.damage_user = dmg;
                    while (monster.damage_avg * monster.battle_count < monster.damage_user){
                        //debug('Monster Damage','Battle count was ' + monster.battle_count);
                        monster.battle_count++;
                    //debug('Monster Damage','Setting battle count to ' + monster.battle_count);
                    }
                    while (monster.damage_avg * monster.battle_count > monster.damage_user * 1.2){
                        //debug('Monster Damage','Battle count was ' + monster.battle_count);
                        monster.battle_count--;
                    //debug('Monster Damage','Setting battle count to ' + monster.battle_count);
                    }
                }
                monster.damage_players += dmg;
                if (fort) {
                    monster.fortify += fort;
                }
            });
            if(types[type].orcs) {
                monster.damage_total = Math.ceil(monster.damage_siege / 1000) + monster.damage_players
            } else {
                monster.damage_total = monster.damage_siege + monster.damage_players;
            }
            monster.dps = monster.damage_players / (timer - monster.timer);
            if (types[type].raid) {
                monster.total = monster.damage_total + $('div[style*="monster_health_back.jpg"] div:nth-child(2)').text().regex(/([0-9]+)/);
            } else {
                monster.total = Math.ceil((1 + 100 * monster.damage_total) / (monster.health == 100 ? 0.1 : (100 - monster.health)));
            }
            monster.eta = Date.now() + (Math.floor((monster.total - monster.damage_total) / monster.dps) * 1000);
        }
    } else if (Page.page === 'keep_monster' || Page.page === 'battle_raid') { // Check monster / raid list
        if (!$('#app'+APPID+'_app_body div.imgButton').length) {
            return false;
        }
        if (Page.page === 'battle_raid') {
            raid = true;
        }
        for (uid in data) {
            for (type in data[uid]) {
                if (((Page.page === 'battle_raid' && this.types[type].raid) || (Page.page === 'keep_monster' && !this.types[type].raid)) && (data[uid][type].state === 'complete' || (data[uid][type].state === 'assist' && data[uid][type].finish < Date.now()))) {
                    data[uid][type].state = null;
                }
            }
        }
        $('#app'+APPID+'_app_body div.imgButton').each(function(i,el){
            var i, uid = $('a', el).attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().parent().children().eq(1).html().regex(/graphics\/([^.]*\....)/i), type = 'unknown';
            for (i in types) {
                if (tmp == types[i].list) {
                    type = i;
                    break;
                }
            }
            if (!uid || type === 'unknown') {
                return;
            }
            data[uid] = data[uid] || {};
            data[uid][type] = data[uid][type] || {};
            if (uid === userID) {
                data[uid][type].name = 'You';
            } else {
                tmp = $(el).parent().parent().children().eq(2).text().trim();
                data[uid][type].name = tmp.regex(/(.+)'s /i);
            }
            switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
                case 2:
                    data[uid][type].state = 'reward';
                    break;
                case 3:
                    data[uid][type].state = 'engage';
                    break;
                case 4:
                    //if (this.types[type].raid && data[uid][type].health) {
                    //data[uid][type].state = 'engage'; // Fix for page cache issues in 2-part raids
                    //} else {
                    data[uid][type].state = 'complete';
                    //}
                    break;
                default:
                    data[uid][type].state = 'unknown';
                    break; // Should probably delete, but keep it on the list...
            }
        });
    }
    return false;
};

Monster.update = function(what) {
    var i, j, list = [], uid = this.runtime.uid, type = this.runtime.type, best = null, req_stamina, req_health
    this.runtime.count = 0;
    for (i in this.data) { // Flush unknown monsters
        for (j in this.data[i]) {
            if (!this.data[i][j].state || this.data[i][j].state === null) {
                log(this.name,'Found Invalid Monster State=(' + this.data[i][j].state + ')');
                delete this.data[i][j];
            } else if (this.data[i][j].state === 'engage') {
                this.runtime.count++;
            }
        }
        if (!length(this.data[i])) { // Delete uid's without an active monster
            log(this.name,'Found Invalid Monster ID=(' + this.data[i] + ')');
            delete this.data[i];
        }
    }
    if (!uid || !type || !this.data[uid] || !this.data[uid][type] || (this.data[uid][type].state !== 'engage' && this.data[uid][type].state !== 'assist')) { // If we've not got a valid target...
        this.runtime.uid = uid = null;
        this.runtime.type = type = null;
    }
    // Testing this out
    uid = null;
    type = null;
	
    //this.runtime.check = false;
    switch (this.option.monster_check){
        case 'Quarterly':
            if (this.option.check_interval !== 900000){
                this.option.check_interval = 900000;
            }
            break;
        case '1/2 Hour':
            if (this.option.check_interval !== 1800000){
                this.option.check_interval = 1800000;
            }
            break;
        case 'Hourly':
            if (this.option.check_interval !== 3600000){
                this.option.check_interval = 3600000;
            }
            break;
        case '2 Hours':
            if (this.option.check_interval !== 7200000){
                this.option.check_interval = 7200000;
            }
            break;
        case '6 Hours':
            if (this.option.check_interval !== 21600000){
                this.option.check_interval = 21600000;
            }
            break;
        case '12 Hours':
            if (this.option.check_interval !== 43200000){
                this.option.check_interval = 43200000;
            }
            break;
        case 'Daily':
            if (this.option.check_interval !== 86400000){
                this.option.check_interval = 86400000;
            }
            break;
        case 'Weekly':
            if (this.option.check_interval !== 604800000){
                this.option.check_interval = 604800000;
            }
            break;
    }
    for (i in this.data) {
        // Look for a new target...
        for (j in this.data[i]) {
            if (((!this.data[i][j].health && this.data[i][j].state === 'engage') || typeof this.data[i][j].last === 'undefined' || (this.data[i][j].last < (Date.now() - this.option.check_interval))) && (typeof this.data[i][j].ignore === 'undefined' || !this.data[i][j].ignore && this.data[i][j].state !== 'complete') && !this.runtime.check) {
                // Check monster progress every hour
                this.runtime.check = true; // Do we need to parse info from a blank monster?
                break;
            }
            req_stamina = (this.types[j].raid && this.option.raid.search('x5') == -1) ? 1 : (this.types[j].raid) ? 5 : (this.option.minstamina < this.types[j].attacks[0] || this.option.maxstamina < this.types[j].attacks[0]) ? this.types[j].attacks[0] : (this.option.minstamina > this.option.maxstamina) ? this.option.maxstamina : this.option.minstamina;
            req_health = this.types[j].raid ? 13 : 10; // Don't want to die when attacking a raid
            if ((typeof this.data[i][j].ignore === 'undefined' || !this.data[i][j].ignore) && this.data[i][j].state === 'engage' && this.data[i][j].finish > Date.now() && (this.option.ignore_stats || (Player.get('health') >= req_health && Queue.burn.stamina >= req_stamina ))) {
                if (!this.data[i][j].battle_count){
                    this.data[i][j].battle_count = 0;
                }
                if (this.data[i][j].name === 'You' && this.option.own){                    
                    list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                    break;
                } else if (this.option.behind_override && (this.data[i][j].eta >= this.data[i][j].finish) && sum(this.data[i][j].damage[userID]) > this.types[j].achievement){
                    //debug(this.name,'Adding behind monster. ' + this.data[i][j].name + '\'s ' + this.types[j].name);
                    list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                    break;
                } else {
                    switch(this.option.stop) {
                        default:
                        case 'Never':
                            list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                            break;
                        case 'Achievement':
                            if (isNumber(this.types[j].achievement) && (typeof this.data[i][j].damage[userID] === 'undefined' || sum(this.data[i][j].damage[userID]) < this.types[j].achievement)) {
                                list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                            }
                            break;
                        case 'Loot':
                            if (isNumber(this.types[j].achievement) && (typeof this.data[i][j].damage[userID] === 'undefined' || sum(this.data[i][j].damage[userID]) < ((i == userID && j === 'keira') ? 200000 : 2 * this.types[j].achievement))) {
                                // Special case for your own Keira to get her soul.
                                list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                            }
                            break;
                    }
                }
            }
        }
    }
    list.sort( function(a,b){       
        switch(Monster.option.choice) {
            case 'Any':
                return (Math.random()-0.5);
                break;
            case 'Strongest':
                return b[2] - a[2];
                break;
            case 'Weakest':
                return a[2] - b[2];
                break;
            case 'Shortest ETD':
                return a[3] - b[3];
                break;
            case 'Longest ETD':
                return b[3] - a[3];
                break;
            case 'Spread':
                return a[4] - b[4];
                break;
            case 'Max Damage':
                return b[5] - a[5];
                break;
            case 'Min Damage':
                return a[5] - b[5];
                break;
            case 'ETD Maintain':
                if (a[7] < b[7]){                    
                    return 1;
                } else if (a[7] > b[7]){                    
                    return -1;
                } else {                    
                    return 0;
                }
                break;
        }
    });
    if (list.length){
        if (!this.option.avoid_behind){
            best = list[0];
        } else {
            for (i=0; i <= list.length; i++){
                if (((list[i][3]/3600000) - (list[i][6]/3600000)).round(0) <= this.option.avoid_hours ){
                    best = list[i];
                    break;
                }
            }
        }
    }
    delete list;
    if (best) {
        uid  = best[0];
        type = best[1];
    }

    this.runtime.uid = uid;
    this.runtime.type = type;
    if (uid && type) {
        this.runtime.stamina = (this.types[type].raid && this.option.raid.search('x5') == -1) ? 1 : (this.types[type].raid) ? 5 : (this.option.minstamina < this.types[type].attacks[0] || this.option.maxstamina < this.types[type].attacks[0]) ? this.types[type].attacks[0] : (this.option.minstamina > this.option.maxstamina) ? this.option.maxstamina : this.option.minstamina;
        this.runtime.health = this.types[type].raid ? 13 : 10; // Don't want to die when attacking a raid        
        this.runtime.energy = (!this.types[type].defends) ? 10 : (this.option.minenergy < this.types[type].defends[0] || this.option.maxenergy < this.types[type].defends[0]) ? this.types[type].defends[0] : (this.option.minenergy > this.option.maxenergy) ? this.option.maxenergy : this.option.minenergy;
        if(this.option.fortify_active && (typeof this.data[uid][type].mclass === 'undefined' || this.data[uid][type].mclass < 2) && ((typeof this.data[uid][type].totaldefense !== 'undefined' && this.data[uid][type].totaldefense < this.option.fortify && this.data[uid][type].defense < 100))) {
            this.runtime.fortify = true;
        } else if (this.option.fortify_active && typeof this.data[uid][type].mclass !== 'undefined' && this.data[uid][type].mclass > 1 && typeof this.data[uid][type].secondary !== 'undefined' && this.data[uid][type].secondary < 100){
            this.runtime.fortify = true;
        } else {
            this.runtime.fortify = false;
        }
        if (Queue.burn.energy < this.runtime.energy) {
            this.runtime.fortify = false;
        }
        this.runtime.attack = true;        
        if (Player.get('health') > this.runtime.health && (this.runtime.fortify && Queue.burn.energy > this.runtime.energy ) || (Queue.burn.stamina > this.runtime.stamina)){
            Dashboard.status(this, (this.runtime.fortify ? 'Fortify' : 'Attack') + ' ' + this.data[uid][type].name + '\'s ' + this.types[type].name + ' (Min Stamina = ' + this.runtime.stamina + ' & Min Energy = ' + this.runtime.energy + ')');
        } else if (this.runtime.fortify && Queue.burn.energy < this.runtime.energy ){
            Dashboard.status(this,'Waiting for ' + (this.runtime.energy - Queue.burn.energy) + ' energy to ' + (this.runtime.fortify ? 'Fortify' : 'Attack') + ' ' + this.data[uid][type].name + '\'s ' + this.types[type].name + ' (Min Stamina = ' + this.runtime.stamina + ' & Min Energy = ' + this.runtime.energy + ')');
        } else if (Queue.burn.stamina < this.runtime.stamina){
            Dashboard.status(this,'Waiting for ' + (this.runtime.stamina - Queue.burn.stamina) + ' stamina to ' + (this.runtime.fortify ? 'Fortify' : 'Attack') + ' ' + this.data[uid][type].name + '\'s ' + this.types[type].name + ' (Min Stamina = ' + this.runtime.stamina + ' & Min Energy = ' + this.runtime.energy + ')');
        } else if (Player.get('health') < this.runtime.health){
            Dashboard.status(this,'Waiting for ' + (this.runtime.health - Player.get('health')) + ' health to ' + (this.runtime.fortify ? 'Fortify' : 'Attack') + ' ' + this.data[uid][type].name + '\'s ' + this.types[type].name + ' (Min Stamina = ' + this.runtime.stamina + ' & Min Energy = ' + this.runtime.energy + ')');
        }
    } else {
        this.runtime.attack = false;
        this.runtime.fortify = false;
        Dashboard.status(this, 'Nothing to do.');
    }
};

Monster.work = function(state) {
    var i, j, target_info = [], battle_list, list = [], uid = this.runtime.uid, type = this.runtime.type, btn = null, b, max;

    if (!this.runtime.check && ((!this.runtime.fortify || Queue.burn.energy < this.runtime.energy || Player.get('health') < 10) && (!this.runtime.attack || Queue.burn.stamina < this.runtime.stamina || Player.get('health') < this.runtime.health))) {
        return false;
    }
    if (!state) {
        return true;
    }
    if (this.runtime.check) { // Parse pages of monsters we've not got the info for
        
        for (i in this.data) {
            for (j in this.data[i]) {
                if (((!this.data[i][j].health && this.data[i][j].state === 'engage') || typeof this.data[i][j].last === 'undefined' || this.data[i][j].last < Date.now() - this.option.check_interval) && (typeof this.data[i][j].ignore === 'undefined' || !this.data[i][j].ignore)) {
                    debug(this.name, 'Reviewing ' + this.data[i][j].name + '\'s ' + this.types[j].name)
                    Page.to(this.types[j].raid ? 'battle_raid' : 'keep_monster', '?user=' + i + (this.types[j].mpool ? '&mpool='+this.types[j].mpool : ''));
                    return true;
                }
            }
        }
        this.runtime.check = false;
        debug(this.name, 'Finished Monster / Raid review')
        return true;
    }
    if (this.types[type].raid) { // Raid has different buttons and generals
        if (!Generals.to(Generals.best((this.option.raid.search('Invade') == -1) ? 'raid-duel' : 'raid-invade'))) {
            return true;
        }       
        switch(this.option.raid) {
            case 'Invade':
                btn = $('input[src$="raid_attack_button.gif"]:first');
                break;
            case 'Invade x5':
                btn = $('input[src$="raid_attack_button3.gif"]:first');
                break;
            case 'Duel':
                btn = $('input[src$="raid_attack_button2.gif"]:first');
                break;
            case 'Duel x5':
                btn = $('input[src$="raid_attack_button4.gif"]:first');
                break;
        }
    } else {
        if (this.data[uid][type].button_fail <= 10 || !this.data[uid][type].button_fail){
            //Primary method of finding button.
            j = (this.runtime.fortify && Queue.burn.energy >= this.runtime.energy) ? 'fortify' : 'attack';
           
            if (!Generals.to(Generals.best(j))) {
                return true;
            }
            debug(this.name,'Try to ' + j + ' [UID=' + uid + ']' + this.data[uid][type].name + '\'s ' + this.types[type].name);
            switch(j){
                case 'fortify':
                    if (!btn && this.option.maxenergy < this.types[type].defends[0]){
                        btn = $(this.types[type].def_btn).eq(0);
                    } else {
                        b = $(this.types[type].def_btn).length - 1;
                        for (i=b; i >= 0; i--){                            
                            //debug(this.name,'Burn Energy is ' + Queue.burn.energy);
                            if (this.types[type].defends[i] <= this.option.maxenergy && Queue.burn.energy >= this.types[type].defends[i] ){
                                //debug(this.name,'Button cost is ' + this.types[type].defends[i]);
                                btn = $(this.types[type].def_btn).eq(i);
                                break;
                            }
                        }
                    }
                    break;
                                      
                case 'attack':
                    if (!btn && this.option.maxstamina < this.types[type].attacks[0]){                        
                        btn = $(this.types[type].atk_btn).eq(0).name;
                    } else {                        
                        b = $(this.types[type].atk_btn).length - 1;
                        //debug(this.name,'B = ' + b);
                        for (i=b; i >= 0; i--){                           
                            //debug(this.name,'Burn Stamina is ' + Queue.burn.stamina);
                            if (this.types[type].attacks[i] <= this.option.maxstamina && Queue.burn.stamina >= this.types[type].attacks[i]){
                                //debug(this.name,'Button cost is ' + this.types[type].attacks[i]);
                                btn = $(this.types[type].atk_btn).eq(i);
                                break;
                            }
                        }
                    }
                    break;
                default:
            }
        }
        if (!btn || !btn.length){
            this.data[uid][type].button_fail = this.data[uid][type].button_fail + 1;
        }
        if (this.data[uid][type].button_fail > 10){
            log(this.name,'Ignoring Monster ' + this.data[uid][type].name + '\'s ' + this.types[type].name + this.data[uid][type] + ': Unable to locate ' + j + ' button ' + this.data[uid][type].button_fail + ' times!');
            this.data[uid][type].ignore = true;
            this.data[uid][type].button_fail = 0
        }
    }
    if (!btn || !btn.length || (Page.page !== 'keep_monster_active' && Page.page !== 'keep_monster_active2') || ($('div[style*="dragon_title_owner"] img[linked]').attr('uid') != uid && $('div[style*="nm_top"] img[linked]').attr('uid') != uid)) {
        //debug(this.name,'Reloading page. Button = ' + btn.attr('name'));
        //debug(this.name,'Reloading page. Page.page = '+ Page.page);
        //debug(this.name,'Reloading page. Monster Owner UID is ' + $('div[style*="dragon_title_owner"] img[linked]').attr('uid') + ' Expecting UID : ' + uid);
        Page.to('keep_monster');
        Page.to(this.types[type].raid ? 'battle_raid' : 'keep_monster', '?user=' + uid + (this.types[type].mpool ? '&mpool='+this.types[type].mpool : ''));
        return true; // Reload if we can't find the button or we're on the wrong page
    }
    if (this.option.assist && typeof $('input[name*="help with"]') !== 'undefined' && (typeof this.data[uid][type].phase === 'undefined' || $('input[name*="help with"]').attr('title').regex(/ (.*)/i) !== this.data[uid][type].phase)){
        debug(this.name,'Current Siege Phase is: '+ this.data[uid][type].phase);
        this.data[uid][type].phase = $('input[name*="help with"]').attr('title').regex(/ (.*)/i);
        debug(this.name,'Found a new siege phase ('+this.data[uid][type].phase+'), assisting now.');
        Page.to(this.types[type].raid ? 'battle_raid' : 'keep_monster', '?user=' + uid + '&action=doObjective' + (this.types[type].mpool ? '&mpool=' + this.types[type].mpool : '') + '&lka=' + i + '&ref=nf');
        return true;
    }
    if (this.types[type].raid) {
        battle_list = Battle.get('user')
        if (this.option.force1) { // Grab a list of valid targets from the Battle Worker to substitute into the Raid buttons for +1 raid attacks.
            for (i in battle_list) {
                list.push(i);
            }
            $('input[name*="target_id"]').val((list[Math.floor(Math.random() * (list.length))] || 0)); // Changing the ID for the button we're gonna push.
        }
        target_info = $('div[id*="raid_atk_lst0"] div div').text().regex(/Lvl\s*([0-9]+).*Army: ([0-9]+)/);
        if ((this.option.armyratio !== 'Any' && ((target_info[1]/Player.get('army')) > this.option.armyratio)) || (this.option.levelratio !== 'Any' && ((target_info[0]/Player.get('level')) > this.option.levelratio))){ // Check our target (first player in Raid list) against our criteria - always get this target even with +1
            log(this.name,'No valid Raid target!');
            Page.to('battle_raid', ''); // Force a page reload to change the targets
            return true;
        }
    }
    this.runtime.uid = this.runtime.type = null; // Force us to choose a new target...
    //debug(this.name,'Clicking Button ' + btn.attr('name'));
    Page.click(btn);
    this.data[uid][type].button_fail = 0;
    return true;
};

Monster.order = null;
Monster.dashboard = function(sort, rev) {
    var i, j, o, monster, url, list = [], output = [], sorttype = [null, 'name', 'health', 'defense', null, 'timer', 'eta'], state = {
        engage:0,
        assist:1,
        reward:2,
        complete:3
    }, blank;
    if (typeof sort === 'undefined') {
        this.order = [];
        for (i in this.data) {
            for (j in this.data[i]) {
                this.order.push([i, j]);
            }
        }
    }
    if (typeof sort === 'undefined') {
        sort = (this.runtime.sort || 1);
    }
    if (typeof rev === 'undefined'){
        rev = (this.runtime.rev || false);
    }
    this.runtime.sort = sort;
    this.runtime.rev = rev;
    this.order.sort(function(a,b) {
        var aa, bb;
        if (state[Monster.data[a[0]][a[1]].state] > state[Monster.data[b[0]][b[1]].state]) {
            return 1;
        }
        if (state[Monster.data[a[0]][a[1]].state] < state[Monster.data[b[0]][b[1]].state]) {
            return -1;
        }
        if (typeof sorttype[sort] === 'string') {
            aa = Monster.data[a[0]][a[1]][sorttype[sort]];
            bb = Monster.data[b[0]][b[1]][sorttype[sort]];
        } else if (sort == 4) { // damage
            //			aa = Monster.data[a[0]][a[1]].damage ? Monster.data[a[0]][a[1]].damage[userID] : 0;
            //			bb = Monster.data[b[0]][b[1]].damage ? Monster.data[b[0]][b[1]].damage[userID] : 0;
            if (typeof Monster.data[a[0]][a[1]].damage !== 'undefined' && typeof Monster.data[b[0]][b[1]].total !== 'undefined' ){
                aa = sum((Monster.data[a[0]][a[1]].damage[userID] / Monster.data[a[0]][a[1]].total));
            }
            if (typeof Monster.data[b[0]][b[1]].damage !== 'undefined' && typeof Monster.data[b[0]][b[1]].total !== 'undefined' ){
                bb = sum((Monster.data[b[0]][b[1]].damage[userID] / Monster.data[b[0]][b[1]].total));
            }
        }
        if (typeof aa === 'undefined') {
            return 1;
        } else if (typeof bb === 'undefined') {
            return -1;
        }
        if (typeof aa === 'string' || typeof bb === 'string') {
            return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
        }
        return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
    });
    th(output, '');
    th(output, 'User');
    th(output, 'Health', 'title="(estimated)"');
    th(output, 'Att Bonus', 'title="Composite of Fortification or Dispel into an approximate attack bonus (+50%...-50%)."');
    //	th(output, 'Shield');
    th(output, 'Damage');
    th(output, 'Time Left');
    th(output, 'Kill In (ETD)', 'title="(estimated)"');
    th(output, '');
    list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
    for (o=0; o<this.order.length; o++) {
        i = this.order[o][0];
        j = this.order[o][1];
        if (!this.types[j]) {
            continue;
        }
        output = [];
        monster = this.data[i][j];
        blank = !((monster.state === 'engage' || monster.state === 'assist') && monster.total);
        // http://apps.facebook.com/castle_age/battle_monster.php?user=00000&mpool=3
        // http://apps.facebook.com/castle_age/battle_monster.php?twt2=earth_1&user=00000&action=doObjective&mpool=3&lka=00000&ref=nf
        // http://apps.facebook.com/castle_age/raid.php?user=00000
        // http://apps.facebook.com/castle_age/raid.php?twt2=deathrune_adv&user=00000&action=doObjective&lka=00000&ref=nf
        if (Monster.option.assist_link && (monster.state === 'engage' || monster.state === 'assist')) {
            url = '?user=' + i + '&action=doObjective' + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '') + '&lka=' + i + '&ref=nf';
        } else {
            url = '?user=' + i + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '');
        }
        td(output, '<a href="http://apps.facebook.com/castle_age/' + (Monster.types[j].raid ? 'raid.php' : 'battle_monster.php') + url + '"><img src="' + imagepath + Monster.types[j].list + '" style="width:72px;height:20px; position: relative; left: -8px; opacity:.7;" alt="' + j + '"><strong class="overlay">' + monster.state + '</strong></a>', 'title="' + Monster.types[j].name + '"');
        var image_url = imagepath + Monster.types[j].list;
        //debug(this.name,image_url);
        th(output, '<a class="golem-monster-ignore" name="'+i+'+'+j+'" title="Toggle Active/Inactive"'+(Monster.data[i][j].ignore ? ' style="text-decoration: line-through;"' : '')+'>'+Monster.data[i][j].name+'</a>');
        td(output, blank ? '' : monster.health === 100 ? '100%' : addCommas(monster.total - monster.damage_total) + ' (' + monster.health.round(1) + '%)');
        td(output, blank ? '' : isNumber(monster.totaldefense) ? ((monster.totaldefense-50).round(1))+'%' : '', (isNumber(monster.strength) ? 'title="Max: '+((monster.strength-50).round(1))+'%"' : ''));
        td(output, blank ? '' : monster.state !== 'engage' ? '' : (typeof monster.damage[userID] === 'undefined') ? '' : addCommas(monster.damage[userID][0] || 0) + ' (' + ((monster.damage[userID][0] || 0) / monster.total * 100).round(2) + '%)', blank ? '' : 'title="In ' + (monster.battle_count || 'an unknown number of') + ' attacks"');
        td(output, blank ? '' : monster.timer ? '<span class="golem-timer">' + makeTimer((monster.finish - Date.now()) / 1000) + '</span>' : '?');
        td(output, blank ? '' : '<span class="golem-timer">' + (monster.health === 100 ? makeTimer((monster.finish - Date.now()) / 1000) : makeTimer((monster.eta - Date.now()) / 1000)) + '</span>');
        th(output, '<a class="golem-monster-delete" name="'+i+'+'+j+'" title="Delete this Monster from the dashboard">[x]</a>');
        tr(list, output.join(''));
    }
    list.push('</tbody></table>');
    $('#golem-dashboard-Monster').html(list.join(''));
    $('a.golem-monster-delete').live('click', function(event){
        var x = $(this).attr('name').split('+');
        Monster._unflush();
        delete Monster.data[x[0]][x[1]];
        if (!length(Monster.data[x[0]])) {
            delete Monster.data[x[0]];
        }
        Monster.dashboard();
        return false;
    });
    $('a.golem-monster-ignore').live('click', function(event){
        var x = $(this).attr('name').split('+');
        Monster._unflush();
        Monster.data[x[0]][x[1]].ignore = !Monster.data[x[0]][x[1]].ignore;
        Monster.dashboard();
        if (Page.page !== 'keep_monster'){
            Page.to('keep_monster');
        } else {
            Page.to('index');
        }
        return false;
    });
    if (typeof sort !== 'undefined') {
        $('#golem-dashboard-Monster thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
    }
};
