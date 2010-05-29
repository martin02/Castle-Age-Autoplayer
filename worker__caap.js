/********** Worker.Caap() **********
* Caap compatibility code
*/
var Caap = new Worker('Caap', 'keep_eliteguard army_viewarmy battle_arena');
Caap.data = {};

Caap.init = function() { 
};

//overload unflush
Worker.prototype._oldunflush = Worker.prototype._unflush;
Worker.prototype._unflush = function() {
	this._oldunflush();
	if (typeof this.caap_values != 'undefined') {
		for (i in this.caap_values) {
			this.option[i] = gm.getValue(this.caap_values[i]);
		}
	}
	(typeof this.caap_load == 'function') && this.caap_load();
}; 

Elite.caap_load = function() {
	this.option.prefer = gm.getListFromText('EliteArmyList');
	this.option.elite = gm.getValue('AutoElite', false);
	this.option.every = 1;
};

Land.caap_values = {
	'enabled':	'autoBuyLand',
	'sell':		'SellLands'
};

Bank.caap_values = {
	'above':	'MaxInCash',
	'hand':		'MinInCash',
	'keep':		'minInStore'
};

Alchemy.caap_values = {
	'perform':	'AutoAlchemy',
	'hearts':	'AutoAlchemyHearts'
};

Alchemy.caap_load = function() {
	this.option.summon = true;
};

Queue.caap_load = function() {
	this.option.pause = false;
};

Heal.caap_values = {
	stamina: 	'MinStamToHeal',
	health: 	'MinToHeal'
};

Blessing.caap_values = {
	which:		'AutoBless'
};

Blessing.caap_load = function() {
	this.option.display = true;
};

