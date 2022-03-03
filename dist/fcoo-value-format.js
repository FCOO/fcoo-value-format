/****************************************************************************
	fcoo-value-format.js,

	(c) 2017, FCOO

	https://github.com/FCOO/fcoo-value-format
	https://github.com/FCOO

****************************************************************************/
//setTimeout( function(){//HER
(function ($, window, document, undefined) {
	"use strict";

	//Create fcoo-namespace
	var ns = window.fcoo = window.fcoo || {};

    /***************************************************************************
    Updating formats on global events
    window.fcoo.events.LANGUAGECHANGED       = 'languagechanged'      : the language
    window.fcoo.events.DATETIMEFORMATCHANGED = 'datetimeformatchanged': the format of dates, time (13:00 or 01:00pm), the timezone, show/hide utc
    window.fcoo.events.LATLNGFORMATCHANGED   = 'latlngformatchanged'  : the format of posiitons/lat-lng
    window.fcoo.events.NUMBERFORMATCHANGED   = 'numberformatchanged'  : the format of numbers (1.000,123 or 1,000.123)
    window.fcoo.events.UNITCHANGED           = `unitchanged`          : the unit use to display variables. Eq. length changed from `km` to `nm`
    ***************************************************************************/
    var updateGlobalEvent = '';
    var formatIdList = [];
    function setGlobalEvent( eventName ){
        //Add event to current global-event
        if (updateGlobalEvent && formatIdList.length){
            var formats = formatIdList.join(' ');
            ns.events.onLast( updateGlobalEvent, function(){
                $.valueFormat.update( formats );
            });
        }
        updateGlobalEvent = eventName;
        formatIdList = [];
    }

    function addFormat( options ){
        $.valueFormat.add( options );
        formatIdList.push( options.id );
    }


    /*************************************
    **************************************
    NUMBER FORMAT
    **************************************
    *************************************/
    setGlobalEvent( ns.events.NUMBERFORMATCHANGED );

    //function round(value, decimals) {
    //    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    //}

    function convertNumber( value ){
        return $.isNumeric( value ) ? value : parseFloat( value );
    }

    function formatNumber( value, options ){
        var decimals = options.decimals !== undefined ? parseInt(options.decimals) : 2,
            format   = options.format ? options.format : '0,0[.]' + (decimals ? Array(decimals+1).join('0') : '');
        return window.numeral( value ).format ( format );
    }

    /*************************************
    formatId = number
    *************************************/
    addFormat({
        id     : 'number',
        format : function( value, options ){
            return formatNumber( value, options );
        },
        convert: convertNumber
    });

    /*************************************
    **************************************
    UNIT (length, area, speed, direction)
    **************************************
    *************************************/
    setGlobalEvent( ns.events.UNITCHANGED );

    ns._globalSetting_edit_UNITCHANGED = function(){
        ns.globalSetting.edit(ns.events.UNITCHANGED);
    };

    function unitWithLink(unitStr, withLink){
        return withLink ? '<a href="javascript:fcoo._globalSetting_edit_UNITCHANGED()">' + unitStr + '</a>' : unitStr;
    }


    function length_height_format( id, get, value, options = {}, isHeight){
            var nrOfDigits = 0,
                removeTrailingZeros = typeof options.removeTrailingZeros == 'boolean' ? options.removeTrailingZeros : true,
                unitId = ns.globalSetting.get(id),
                unitStr = length_height_unit(unitId);


            //height in km or nm gets 1 decimal
            if (isHeight && ((unitId == ns.unit.METRIC2) || (unitId == ns.unit.NAUTICAL))){
                value = Math.round(value);
                nrOfDigits = 3;
            }


            //If unit = m and value > 1000 => convert to km and set digits = 3
            if (!options.keepUnit && (unitId == ns.unit.METRIC) && (Math.abs(value) >= 1000)){
                unitStr = length_height_unit(ns.unit.METRIC2); //='km';
                value = value / 1000;
                nrOfDigits = 3;
            }

            return ns.number.numberFixedWidth(get( value ), nrOfDigits, removeTrailingZeros) + '&nbsp;' + unitWithLink(unitStr, options && options.withUnitLink);
    }

    function length_height_unit(unitId){
        var unit = '';
        switch (unitId){
            case ns.unit.METRIC  : unit =  'm'; break;
            case ns.unit.METRIC2 : unit = 'km'; break;
            case ns.unit.FEET    : unit = 'ft'; break;
            case ns.unit.NAUTICAL: unit = 'nm'; break;
        }
        return unit;

    }

    function get_length_height_unit(settingId){
        return length_height_unit( ns.globalSetting.get(settingId) );
    }

    function length_height_unit_format(id){
        return unitWithLink(get_length_height_unit(id), true);
    }



    //length
    addFormat({id: 'length',        format: function( value, options = {}){ return length_height_format( 'length', ns.unit.getLength, value, options ); } });

    //length unit
    addFormat({id: 'length_unit',   format: function(){ return length_height_unit_format('length'); } });

    //height
    addFormat({id: 'height',        format: function( value, options = {}){
                                        options = options || {};
                                        if (options.keepUnit == undefined)
                                            options.keepUnit = true;
                                        return length_height_format( 'height', ns.unit.getHeight, value, options, true );
                                    }
    });

    //height unit
    addFormat({id: 'height_unit',   format: function(){ return length_height_unit_format('height'); }
    });


    //area
    addFormat({
        id    : 'area',
        format: function( value, options ){
            var nrOfDigits = 3,
                removeTrailingZeros = options && (typeof options.removeTrailingZeros == 'boolean') ? options.removeTrailingZeros : true,
                unitStr = 'm';

            if (ns.globalSetting.get('area') == ns.unit.NAUTICAL)
                unitStr = 'nm';
            else {
                //Convert from m2 to km2 if >= 10000m2
                if (Math.abs(value) >= 10000){
                    value = value / (1000*1000);
                    unitStr = 'km';
                }
                else
                    nrOfDigits = 0;
            }
            return ns.number.numberFixedWidth(
                ns.unit.getArea( value ),
                nrOfDigits,
                removeTrailingZeros
            ) + '&nbsp;' + unitWithLink(unitStr + '<sup>2</sup>', options && options.withUnitLink);

        }
    });

    //area unit
    addFormat({
        id    : 'area_unit',
        format: function(){
            return unitWithLink((ns.globalSetting.get('area') == ns.unit.NAUTICAL ? 'nm' : 'km')+'<sup>2</sup>', true);
        }
    });

    //direction
    addFormat({
        id    : 'direction',
        format: function( value, options ){
            var unitStr;
            options = $.extend({ decimals: 0}, options || {});
            switch (ns.globalSetting.get('direction')){
                case ns.unit.DEGREE : unitStr = '<sup>o</sup>'; break;
                case ns.unit.GRADIAN: unitStr = '<sup>g</sup>'; break; //or <sup>c</sup> or <sup>R</sup>
            }

            return formatNumber(ns.unit.getDirection( value ), options ) +  unitWithLink(unitStr, options.withUnit);
        }
    });


    /****************************************************************************
    directionAsText
    Convert a 0-359 direction to N, NNE, NE, ENE, E,...
    ****************************************************************************/
    ns.directionText = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"];
    //Could be in Danish as ["N","NNØ","NØ","ØNØ","Ø","ØSØ","SØ","SSØ","S","SSV","SV","VSV","V","VNV","NV","NNV","N"];
    //Could be extended to 64: ["N","N t. Ø","NNØ","NØ t. N","NØ","NØ t. Ø","ØNØ","Ø t. N","Ø","Ø t. S","ØSØ","SØ t. Ø","SØ","SØ t. S","SSØ","S t. Ø","S","S t. V","SSV","SV t. S","SV","SV t. V","VSV","V t. S","V","V t. N","VNV","NV t. V","NV","NV t. N","NNV","N t. V","N"]

    var sectionDeg = 360/(ns.directionText.length-1);

    ns.directionAsText = function(direction, directionFrom){
        direction = (direction + 360 + (directionFrom ? 180 : 0)) % 360;
        return ns.directionText[Math.round(direction / sectionDeg)];
    };


    //direction_text
    addFormat({
        id    : 'direction_text',
        format: function( value, options ){
                    return ns.directionAsText(value, options && (options.directionFrom || options.from));
                }
    });


    //speed and direction unit - also updated on language changed
    setGlobalEvent( ns.events.UNITCHANGED + ' ' + ns.events.LANGUAGECHANGED );

    //direction unit
    addFormat({
        id    : 'direction_unit',
        format: function(){
            var unitStr;
            switch (ns.globalSetting.get('direction')){
                case ns.unit.DEGREE : unitStr = window.i18next.sentence({ da:'Grader (0-360<sup>o</sup>)',   en:'Degree (0-360<sup>o</sup>)'  }); break;
                case ns.unit.GRADIAN: unitStr = window.i18next.sentence({ da:'Nygrader (0-400<sup>g</sup>)', en:'Gradian (0-400<sup>g</sup>)' }); break;
            }
            return unitWithLink(unitStr, true);
        }
    });

    //speed - also updated on language changed
    setGlobalEvent( ns.events.UNITCHANGED + ' ' + ns.events.LANGUAGECHANGED );
    addFormat({
        id    : 'speed',
        format: function( value, options ){
            var removeTrailingZeros = options && (typeof options == 'boolean') ? options : true,
                unitStr;
            switch (ns.globalSetting.get('speed')){
                case ns.unit.METRIC  : unitStr = 'm/s'; break;
                case ns.unit.METRIC2 : unitStr = window.i18next.sentence( {da:'km/t', en:'km/h'}); break;
                case ns.unit.NAUTICAL: unitStr = 'kn'; break; //window.i18next.sentence( {da:'knob', en:'knots'}); break;
            }

            return ns.number.numberFixedWidth(ns.unit.getSpeed( value ), 3, removeTrailingZeros) + '&nbsp;' + unitWithLink(unitStr, options && options.withUnitLink);
        }
    });

    //Speed unit
    addFormat({
        id    : 'speed_unit',
        format: function(){
            var unitStr = '';
            switch (ns.globalSetting.get('speed')){
                case ns.unit.METRIC  : unitStr = 'm/s'; break;
                case ns.unit.METRIC2 : unitStr = window.i18next.sentence( {da:'km/t', en:'km/h'}); break;
                case ns.unit.NAUTICAL: unitStr = window.i18next.sentence( {da:'knob', en:'knots'}); break;
            }
            return unitWithLink(unitStr, true);
        }
    });


    /*************************************
    **************************************
    LATLNG
    **************************************
    *************************************/
    setGlobalEvent( ns.events.LATLNGFORMATCHANGED + ' ' + ns.events.NUMBERFORMATCHANGED );

    /*************************************
    formatId = latlng
    *************************************/
    addFormat({
        id    : 'latlng',
        format: function( latLng, options ){
            options = options || {};
            if (options.separator == undefined)
                options.separator = '&nbsp;';
            return latLng ? window.latLngFormat(latLng[0], latLng[1]).format(options) : '';
         }
     });


    /*************************************
    **************************************
    DATE AND TIME (MOMENT)
    **************************************
    *************************************/
    setGlobalEvent( ns.events.DATETIMEFORMATCHANGED );

    function convertMoment( momentOrStr ){
        return jQuery.type( momentOrStr ) == "string" ? momentOrStr : momentOrStr.format();
    }

    function convertBackMoment( str ){
        return moment(str);
    }

    function addMomentFormat(id, formatFunc ){
        addFormat({id: id, format: formatFunc, convert: convertMoment, convertBack: convertBackMoment });
    }


    /*************************************
    formatId = time, hour
    Time/hour in current timezone
    *************************************/
    addMomentFormat( 'time',        function( m ){ return m.tzMoment().timeFormat(); } );
    addMomentFormat( 'hour',        function( m ){ return m.tzMoment().hourFormat(); } );
    addMomentFormat( 'time_utc',    function( m ){ return m.utc().timeFormat();      } );
    addMomentFormat( 'hour_utc',    function( m ){ return m.utc().hourFormat();      } );
    addMomentFormat( 'time_local',  function( m ){ return m.local().timeFormat();    } );
    addMomentFormat( 'hour_local',  function( m ){ return m.local().hourFormat();    } );


    /*************************************
    formatId = timezone, timezone_full
    *************************************/
    function timezoneFormat( options ){
        var timezoneText = '',
            timezoneFormat = options.showTimezone || 'NONE';
        timezoneFormat = timezoneFormat.toUpperCase();
        timezoneFormat = timezoneFormat == 'FULL'  ? 'F' :
                         timezoneFormat == 'SHORT' ? 'S' :
                         timezoneFormat == 'NONE'  ? 'N' :
                         timezoneFormat;

        switch (timezoneFormat){
          case 'S': timezoneText = moment.simpleFormat.timezone.name; break;
          case 'F': timezoneText = moment.simpleFormat.timezone.fullName; break;
        }

        if (timezoneText && options.inclParenthesis)
            timezoneText = '(' + timezoneText + ')';
        return timezoneText;
    }

    addFormat({ id: 'timezone',      format: function( dummy, options  ){ return  timezoneFormat( {showTimezone:'SHORT', inclParenthesis: options.inclParenthesis} );  } });
    addFormat({ id: 'timezone_full', format: function( dummy, options  ){ return  timezoneFormat( {showTimezone:'FULL',  inclParenthesis: options.inclParenthesis} );  } });


    /*************************************
    formatId = date[_XX], datetime[_XX]
    *************************************/
    function momentFormat( m, options, dateFormat, datetime, tz ){
        options = options || {};
        if (dateFormat)
            options.dateFormat = dateFormat;
        var formatFunc = datetime ? moment.fn.dateTimeFormat : moment.fn.dateFormat,
            timezoneText = timezoneFormat( options );
        return formatFunc.call(
                    tz == 'utc'   ? m.utc() :
                    tz == 'local' ? m.local() :
                                    m.tzMoment(),
                    options
                ) +
                (timezoneText ? '&nbsp;'+timezoneText : '');
    }

    //Format: 'FULL', 'SHORT', 'DIGITAL', 'NONE'
    var dateDefaultFormat     = { weekday: 'None',  month: 'Short',   year: 'Full'  },
        dateWeekdayFormat     = { weekday: 'Full',  month: 'Short',   year: 'Full'  },
        dateLongFormat        = { weekday: 'None',  month: 'Full',    year: 'Full'  },
        dateLongWeekdayFormat = { weekday: 'Full',  month: 'Full',    year: 'Full'  },
        dateShortFormat       = { weekday: 'None',  month: 'Digital', year: 'Short' };

    addMomentFormat( 'date',                    function( m, options ){ return momentFormat( m, options, dateDefaultFormat     ); } );
    addMomentFormat( 'date_weekday',            function( m, options ){ return momentFormat( m, options, dateWeekdayFormat     ); } );
    addMomentFormat( 'date_long',               function( m, options ){ return momentFormat( m, options, dateLongFormat        ); } );
    addMomentFormat( 'date_long_weekday',       function( m, options ){ return momentFormat( m, options, dateLongWeekdayFormat ); } );
    addMomentFormat( 'date_short',              function( m, options ){ return momentFormat( m, options, dateShortFormat       ); } );
    addMomentFormat( 'date_format',             function( m, options ){ return momentFormat( m, options                        ); } );

    addMomentFormat( 'date_utc',                function( m, options ){ return momentFormat( m, options, dateDefaultFormat,     false, 'utc' ); } );
    addMomentFormat( 'date_weekday_utc',        function( m, options ){ return momentFormat( m, options, dateWeekdayFormat,     false, 'utc' ); } );
    addMomentFormat( 'date_long_utc',           function( m, options ){ return momentFormat( m, options, dateLongFormat,        false, 'utc' ); } );
    addMomentFormat( 'date_long_weekday_utc',   function( m, options ){ return momentFormat( m, options, dateLongWeekdayFormat, false, 'utc' ); } );
    addMomentFormat( 'date_short_utc',          function( m, options ){ return momentFormat( m, options, dateShortFormat,       false, 'utc' ); } );
    addMomentFormat( 'date_format_utc',         function( m, options ){ return momentFormat( m, options, null,                  false, 'utc' ); } );

    addMomentFormat( 'date_local',              function( m, options ){ return momentFormat( m, options, dateDefaultFormat,     false, 'local' ); } );
    addMomentFormat( 'date_weekday_local',      function( m, options ){ return momentFormat( m, options, dateWeekdayFormat,     false, 'local' ); } );
    addMomentFormat( 'date_long_local',         function( m, options ){ return momentFormat( m, options, dateLongFormat,        false, 'local' ); } );
    addMomentFormat( 'date_long_weekday_local', function( m, options ){ return momentFormat( m, options, dateLongWeekdayFormat, false, 'local' ); } );
    addMomentFormat( 'date_short_local',        function( m, options ){ return momentFormat( m, options, dateShortFormat,       false, 'local' ); } );
    addMomentFormat( 'date_format_local',       function( m, options ){ return momentFormat( m, options, null,                  false, 'local' ); } );

    addMomentFormat( 'datetime',                function( m, options ){ return momentFormat( m, options, dateDefaultFormat,     true       ); } );
    addMomentFormat( 'datetime_weekday',        function( m, options ){ return momentFormat( m, options, dateWeekdayFormat,     true       ); } );
    addMomentFormat( 'datetime_long',           function( m, options ){ return momentFormat( m, options, dateLongFormat,        true       ); } );
    addMomentFormat( 'datetime_long_weekday',   function( m, options ){ return momentFormat( m, options, dateLongWeekdayFormat, true       ); } );
    addMomentFormat( 'datetime_short',          function( m, options ){ return momentFormat( m, options, dateShortFormat,       true       ); } );
    addMomentFormat( 'datetime_format',         function( m, options ){ return momentFormat( m, options, null,                  true       ); } );

    addMomentFormat( 'datetime_utc',              function( m, options ){ return momentFormat( m, options, dateDefaultFormat,     true, 'utc' ); } );
    addMomentFormat( 'datetime_weekday_utc',      function( m, options ){ return momentFormat( m, options, dateWeekdayFormat,     true, 'utc' ); } );
    addMomentFormat( 'datetime_long_utc',         function( m, options ){ return momentFormat( m, options, dateLongFormat,        true, 'utc' ); } );
    addMomentFormat( 'datetime_long_weekday_utc', function( m, options ){ return momentFormat( m, options, dateLongWeekdayFormat, true, 'utc' ); } );
    addMomentFormat( 'datetime_short_utc',        function( m, options ){ return momentFormat( m, options, dateShortFormat,       true, 'utc' ); } );
    addMomentFormat( 'datetime_format_utc',       function( m, options ){ return momentFormat( m, options, null,                  true, 'utc' ); } );

    addMomentFormat( 'datetime_local',              function( m, options ){ return momentFormat( m, options, dateDefaultFormat,     true, 'local' ); } );
    addMomentFormat( 'datetime_weekday_local',      function( m, options ){ return momentFormat( m, options, dateWeekdayFormat,     true, 'local' ); } );
    addMomentFormat( 'datetime_long_local',         function( m, options ){ return momentFormat( m, options, dateLongFormat,        true, 'local' ); } );
    addMomentFormat( 'datetime_long_weekday_local', function( m, options ){ return momentFormat( m, options, dateLongWeekdayFormat, true, 'local' ); } );
    addMomentFormat( 'datetime_short_local',        function( m, options ){ return momentFormat( m, options, dateShortFormat,       true, 'local' ); } );
    addMomentFormat( 'datetime_format_local',       function( m, options ){ return momentFormat( m, options, null,                  true, 'local' ); } );


    /*************************************
    formatId = relative_XX
    *************************************/
    function momentRelativeFormat( m, format ){
        function formatContain(char){ return format.indexOf(char) > -1; }
        return m.relativeFormat({
            relativeFormat: {
                now     : true,
                days    : formatContain('D'),
                hours   : formatContain('H'),
                minutes : formatContain('M')
            }
        });
    }

    addMomentFormat( 'relative',     function( m ){ return momentRelativeFormat( m, 'DH'  ); } );
    addMomentFormat( 'relative_m',   function( m ){ return momentRelativeFormat( m, 'M'   ); } );
    addMomentFormat( 'relative_h',   function( m ){ return momentRelativeFormat( m, 'H'   ); } );
    addMomentFormat( 'relative_d',   function( m ){ return momentRelativeFormat( m, 'D'   ); } );
    addMomentFormat( 'relative_hm',  function( m ){ return momentRelativeFormat( m, 'HM'  ); } );
    addMomentFormat( 'relative_dh',  function( m ){ return momentRelativeFormat( m, 'DH'  ); } );
    addMomentFormat( 'relative_dhm', function( m ){ return momentRelativeFormat( m, 'DHM' ); } );


    /*************************************
    formatId = time_sup_XX
    *************************************/
    function momentTimeSupFormat(m, relativeHours/*rel2m*/){
        //Return m.timeFormat() with sup +/-1,2,... if m and rel2m has different date
        //Eq. m=22:00 may 1th, rel2m = 02:00 may 2th => result = 22:00<sup>-1</sup> "22:00 the day before"
        if (!m.isValid()) return '';
        var relativeM = m.clone().add(relativeHours, 'hours'),
            result = m.timeFormat();
        if (m.dateFormat() != relativeM.dateFormat()){
            var dayDiff = m.clone().startOf('day').diff(relativeM.startOf('day'), 'days');
            result = result + '<sup>' + (dayDiff > 0 ? '+' : '') + dayDiff + '</sup>';
        }
        return result;
    }

    //time_utc_sup = time of utc with sup of day-different
    addMomentFormat( 'time_utc_sup', function( m ){
        if (!m.isValid()) return '';
        return momentTimeSupFormat( moment.utc(m), m.tzMoment().utcOffset()/60  );
    });

    //time_now_sup = time of current tz with sup of day-different to now (same tz)
    addMomentFormat( 'time_now_sup', function( m ){
        if (!m.isValid()) return '';
        return momentTimeSupFormat( m.tzMoment(), moment().diff(m.tzMoment(), 'hours') );
    });

    //time_other_sup = time of current tz with sup of day-different to another moment given in options (same tz)
    addMomentFormat( 'time_other_sup', function( m, options ){
        if (!m.isValid()) return '';
        return momentTimeSupFormat( m.tzMoment(), moment(options.other).diff(m.tzMoment(), 'hours') );
    });




    //Flush global-events
    setGlobalEvent( 'dummy' );

/*
    //Initialize/ready
	$(function() {


	});
*/
}(jQuery, this, document));
