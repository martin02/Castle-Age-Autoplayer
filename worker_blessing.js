/********** Worker.Blessing **********
* Automatically receive blessings
*/
var Blessing = new Worker('Blessing');
Blessing.data = null;

Blessing.defaults = {
	castle_age:{
		pages:'oracle_demipower'
	}
};

Blessing.option = {
	which:'Stamina',
        display: false
};

Blessing.runtime = {
	when:0
};

Blessing.which = ['None', 'Energy', 'Attack', 'Defense', 'Health', 'Stamina'];
Blessing.display = [
    {
	id:'which',
	label:'Which',
	select:Blessing.which
    },{
        id:'display',
        label:'Display in Blessing info on *',
        checkbox:true
    }
];

Blessing.init = function(){
	iscaap() && Blessing.update();
};

Blessing.parse = function(change) {
	var result = $('div.results'), time;
	if (result.length) {
		time = result.text().regex(/Please come back in: ([0-9]+) hours and ([0-9]+) minutes/i);
		if (time && time.length) {
			this.runtime.when = Date.now() + (((time[0] * 60) + time[1] + 1) * 60000);
		} else if (result.text().match(/You have paid tribute to/i)) {
			this.runtime.when = Date.now() + 86460000; // 24 hours and 1 minute
		}
	}
	return false;
};

Blessing.update = function(){
    var d, demi;
     if (this.option.display && this.option.which !== 'None'){
         d = new Date(this.runtime.when);
         switch(this.option.which){
             case 'Energy':
                 demi = 'Ambrosia (' + this.option.which + ')';
                 break;
             case 'Attack':
                 demi = 'Malekus (' + this.option.which + ')';
                 break;
             case 'Defense':
                 demi = 'Corvintheus (' + this.option.which + ')';
                 break;
             case 'Defense':
                 demi = 'Corvintheus (' + this.option.which + ')';
                 break;
             case 'Health':
                 demi = 'Aurora (' + this.option.which + ')';
                 break;
             case 'Stamina':
                 demi = 'Azeron (' + this.option.which + ')';
                 break;
             default:
                 demi = 'Unknown';
                 break;
         }
         Dashboard.status(this, '<span title="Next Blessing">' + 'Next Blessing performed on ' + d.format('l g:i a') + ' to ' + demi + ' </span>');
		iscaap() && caap.SetDivContent('demibless_mess', 'Next Demi Blessing: ' + d.format('l g:i a'));
     } else {
         Dashboard.status(this);
		iscaap() && caap.SetDivContent('demibless_mess', 'Demi Blessing = none');
     }
};

Blessing.work = function(state) {
	if (!this.option.which || this.option.which === 'None' || Date.now() <= this.runtime.when) {
		return QUEUE_FINISH;
	}
	if (!state || !Page.to('oracle_demipower')) {
		return QUEUE_CONTINUE;
	}
	Page.click('#app'+APPID+'_symbols_form_'+this.which.indexOf(this.option.which)+' input.imgButton');
	return QUEUE_RELEASE;
};

