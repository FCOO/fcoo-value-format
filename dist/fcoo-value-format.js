/****************************************************************************
	fcoo-value-format.js, 

	(c) 2017, FCOO

	https://github.com/FCOO/fcoo-value-format
	https://github.com/FCOO

****************************************************************************/

(function ($, window, document, undefined) {
	"use strict";
	
	//Create fcoo-namespace
	window.fcoo = window.fcoo || {};
	var ns = window.fcoo; 

    /***************************************************************************
    Updating formats on global events
    languagechanged      : the language
    datetimeformatchanged: the format of dates, time (13:00 or 01:00pm), the timezone, show/hide utc
    numberformatchanged  : the format of numbers (1.000,123 or 1,000.123)
    latlngformatchanged  : the format of posiitons/lat-lng
    ***************************************************************************/
    var updateGlobalEvent = '';
    var formatIdList = [];
    function setGlobalEvent( eventName ){
        //Add event to current global-event
        if (updateGlobalEvent && formatIdList.length){
            var formats = formatIdList.join(' ');
            ns.events.onLast( updateGlobalEvent, function(){ $.valueFormat.update( formats ); });
        }
        updateGlobalEvent = eventName;
        formatIdList = [];
    }

    function addFormat( options ){
        $.valueFormat.add( options );
        formatIdList.push( options.id );          
    }


    /*************************************
    NUMBER AND DISTANCE
    *************************************/
    setGlobalEvent( 'numberformatchanged' );

    function getDecimals( options, defaultDecimals ){
        return options.decimals !== undefined ? parseInt(options.decimals) : defaultDecimals !== undefined ? defaultDecimals : 2;
    }

    function round(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

    function convertNumber( value ){
        return $.isNumber( value ) ? value : parseFloat( value );
    } 

    function formatNumber( value, options ){
        var decimals = getDecimals( options ),
            format = options.format ? options.format : '0,0[.]' + (decimals ? Array(decimals+1).join('0') : '');
        return window.numeral( value ).format ( format );
    } 

    /*************************************
    formatId = number
    *************************************/
    addFormat({ 
        id     : 'number', 
        format : function( value, options ){ return formatNumber( value, options ); },
        convert: convertNumber
    });

    /*************************************
    formatId = distance
    *************************************/
    addFormat({ 
        id     : 'distance', 
        format : function( value, options ){ 
            var factor = 1,
                unitStr = ' m';
            switch (options.unit){
              case 'nm': factor = 1862; unitStr = ' nm';break;
              case 'km': factor = 1000; unitStr = ' km';break;
            }
            
            value = round( value/factor, getDecimals( options ) );
            return formatNumber( value, options) + unitStr; 
        },
        convert: convertNumber
    });
    
    /*************************************
    LATLNG
    *************************************/
    setGlobalEvent( 'latlngformatchanged' );

    function convertLatLng( latLng ){
        return L.latLng( {lat:latLng.lat, lng:latLng.lng} );
    }

    /*************************************
    formatId = lat, lng
    *************************************/
    addFormat({ id: 'lat', format : function( latLng ){ return latLng.formatLat(); }, convert: convertLatLng });
    addFormat({ id: 'lng', format : function( latLng ){ return latLng.formatLng(); }, convert: convertLatLng });

    /*************************************
    formatId = latlng
    *************************************/
    addFormat({ 
        id: 'latlng',
        format : function( latLng, options ){ 
            return latLng.format().join(options.separator ? options.separator : '&nbsp;');
         }, 
         convert: convertLatLng 
     });    

    
    
    /*************************************
    DATE AND TIME (MOMENT)
    *************************************/
    setGlobalEvent( 'datetimeformatchanged' );

    //Since changing language using moment.locale(...) do not change allready created moment-object 
    //the moment are saved as a Date-object or as moment and 're-constructed' when the display is updated
    function convertMoment( m, options ){ 
        return options.saveAsMoment ? m : m.toDate();     
    }
    
    function convertBackMoment( m, options ){ 
        m = m ? m : moment();
        return moment( options.saveAsMoment ? m.toDate() : m ); 
    }

    function addMomentFormat(id, formatFunc ){
        addFormat({id: id, format: formatFunc, convert: convertMoment, convertBack: convertBackMoment });    
    }


    //Date-format named date_XX_obj 


    /*************************************
    formatId = time, hour
    Time/hour in current timezone
    *************************************/
    addMomentFormat( 'time',     function( m ){ return m.tzMoment().timeFormat(); } );    
    addMomentFormat( 'hour',     function( m ){ return m.tzMoment().hourFormat(); } );    
    addMomentFormat( 'time_utc', function( m ){ return m.utc().timeFormat();      } );    
    addMomentFormat( 'hour_utc', function( m ){ return m.utc().hourFormat();      } );    

   
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
    function momentFormat( m, options, dateFormat, datetime, utc ){
        options = options || {};
        if (dateFormat)
            options.dateFormat = dateFormat;
        var formatFunc = datetime ? moment.fn.dateTimeFormat : moment.fn.dateFormat,
            timezoneText = timezoneFormat( options );
        return formatFunc.call( utc ? m.utc() : m.tzMoment(), options ) + (timezoneText ? '&nbsp;'+timezoneText : '');    
    }

    //Format: 'FULL', 'SHORT', 'DIGITAL', 'NONE'
    var dateDefaultFormat = { weekday: 'None',  month: 'Short',   year: 'Full' },
        dateLongFormat    = { weekday: 'Full',  month: 'Full',    year: 'Full' },
        dateShortFormat   = { weekday: 'None',  month: 'Digital', year: 'Short' };

    addMomentFormat( 'date',                function( m, options ){ return momentFormat( m, options, dateDefaultFormat ); } );
    addMomentFormat( 'date_long',           function( m, options ){ return momentFormat( m, options, dateLongFormat    ); } );
    addMomentFormat( 'date_short',          function( m, options ){ return momentFormat( m, options, dateShortFormat   ); } );
    addMomentFormat( 'date_format',         function( m, options ){ return momentFormat( m, options                    ); } );

    addMomentFormat( 'date_utc',            function( m, options ){ return momentFormat( m, options, dateDefaultFormat, false, true ); } );
    addMomentFormat( 'date_long_utc',       function( m, options ){ return momentFormat( m, options, dateLongFormat,    false, true ); } );
    addMomentFormat( 'date_short_utc',      function( m, options ){ return momentFormat( m, options, dateShortFormat,   false, true ); } );
    addMomentFormat( 'date_format_utc',     function( m, options ){ return momentFormat( m, options, null,              false, true ); } );
    
    addMomentFormat( 'datetime',            function( m, options ){ return momentFormat( m, options, dateDefaultFormat, true       ); } );
    addMomentFormat( 'datetime_long',       function( m, options ){ return momentFormat( m, options, dateLongFormat,    true       ); } );
    addMomentFormat( 'datetime_short',      function( m, options ){ return momentFormat( m, options, dateShortFormat,   true       ); } );
    addMomentFormat( 'datetime_format',     function( m, options ){ return momentFormat( m, options, null,              true       ); } );

    addMomentFormat( 'datetime_utc',        function( m, options ){ return momentFormat( m, options, dateDefaultFormat, true, true ); } );
    addMomentFormat( 'datetime_long_utc',   function( m, options ){ return momentFormat( m, options, dateLongFormat,    true, true ); } );
    addMomentFormat( 'datetime_short_utc',  function( m, options ){ return momentFormat( m, options, dateShortFormat,   true, true ); } );
    addMomentFormat( 'datetime_format_utc', function( m, options ){ return momentFormat( m, options, null,              true, true ); } );
    


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