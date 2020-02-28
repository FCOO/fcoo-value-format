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
    UNIT (length, area, speed, ddirection)
    **************************************
    *************************************/
    setGlobalEvent( ns.events.UNITCHANGED );

    //length
    addFormat({
        id    : 'length',
        format: function( value, options ){
            var nrOfDigits = 3,
                removeTrailingZeros = options && (typeof options.removeTrailingZeros == 'boolean') ? options.removeTrailingZeros : true,
                unitStr = 'm';

            if (ns.globalSetting.get('length') == ns.unit.NAUTICAL)
                unitStr = 'nm';
            else {
                //Convert from m to km if >= 1000m
                if (Math.abs(value) >= 1000){
                    value = value / 1000;
                    unitStr = 'km';
                }
                else
                    nrOfDigits = 0;
            }
            return ns.number.numberFixedWidth(
                ns.unit.getLength( value ),
                nrOfDigits,
                removeTrailingZeros
            ) + '&nbsp;' + unitStr;

        }
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
            ) + '&nbsp;' + unitStr + '<sup>2</sup>';

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

            return formatNumber(ns.unit.getDirection( value ), options ) +  unitStr;
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

            return ns.number.numberFixedWidth(ns.unit.getSpeed( value ), 3, removeTrailingZeros) + '&nbsp;' + unitStr;
        }
    });


    /*************************************
    **************************************
    LATLNG
    **************************************
    *************************************/
    setGlobalEvent( ns.events.LATLNGFORMATCHANGED );

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
        var options = {};
        switch (format){
          case 'H'  : options.relativeFormat = {now: true, days: false, hours: true, minutes: false }; break;
          case 'HM' : options.relativeFormat = {now: true, days: false, hours: true, minutes: true  }; break;
          case 'DHM': options.relativeFormat = {now: true, days: true,  hours: true, minutes: true  }; break;
          default   : options.relativeFormat = {now: true, days: true,  hours: true, minutes: false };
        }
        return m.relativeFormat( options );
    }

    addMomentFormat( 'relative',     function( m ){ return momentRelativeFormat( m, 'DH'  ); } );
    addMomentFormat( 'relative_dh',  function( m ){ return momentRelativeFormat( m, 'DH'  ); } );
    addMomentFormat( 'relative_h',   function( m ){ return momentRelativeFormat( m, 'H'   ); } );
    addMomentFormat( 'relative_hm',  function( m ){ return momentRelativeFormat( m, 'HM'  ); } );
    addMomentFormat( 'relative_dhm', function( m ){ return momentRelativeFormat( m, 'DHM' ); } );


    //Flush global-events
    setGlobalEvent( 'dummy' );

/*
    //Initialize/ready
	$(function() {


	});
*/
}(jQuery, this, document));

//}, 2000);//HER