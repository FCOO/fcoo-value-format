# fcoo-value-format
[jquery-value-format]:https://github.com/FCOO/jquery-value-format
[fcoo-moment]:https://github.com/FCOO/fcoo-moment
[moment-simple-format]:https://github.com/FCOO/moment-simple-format
[fcoo-language]: https://github.com/FCOO/fcoo-language
[i18n]:http://i18next.com/
[fcoo-number]:https://github.com/FCOO/fcoo-number
[fcoo-unit]:https://github.com/FCOO/fcoo-unit
[numeral.js]:http://numeraljs.com/
[fcoo-latlng-format]:https://github.com/FCOO/fcoo-latlng-format
[latlng-format]:https://github.com/FCOO/latlng-format
[fcoo-global-events]:https://github.com/FCOO/fcoo-global-events

## Description
`fcoo-value-format` combines a number of packages that formats different type of data (*"Formator"*) with a number of FCOO-packages that sets up different formats for different type of data (*"Administrator"*)
[jquery-value-format] is used to define a number of standard formats to be used in FCOOs Web Applications

### "Formator"
in [FCOO Web Applications](https://github.com/FCOO/fcoo-application) we use the following packages to format and translate text, date, positions, and values

- [i18n] (translation)
- [moment-simple-format] (date and time format, timezone etc.)
- [latlng-format] (position)
- [numeral.js] (numeral formats)

### "Administrator"
To set up the different formats, to provide interaction between the different *Formator* (e.g. date-format includes translation of name of months), to save the users selection, and to fire the appropriate events defined in [fcoo-global-events] the following packages are created and used

- [fcoo-language]
- [fcoo-moment]
- [fcoo-latlng-format]
- [fcoo-unit]
- [fcoo-number]

### fcoo-value-format

With [jquery-value-format] you assign a `value` and a (predefined) `format` to a html-element and [jquery-value-format] will format the value using the defined format
If the user changes the format (e.g. date as `2017-01-30` instead of `30-01-2017`) `fcoo-value-format` would change all html-element containing date-values

**`fcoo-value-format`** defines a number of different common formats to be used i FCOO Web Applications (see below)

## Installation
### bower
`bower install https://github.com/FCOO/fcoo-value-format.git --save`

## Demo
http://FCOO.github.io/fcoo-value-format/demo/ 


## Number with fixed number of digits

To convert values of different magnitude to (almost) equal size a method is created

    window.fcoo.number.numberFixedWidth( value, nrOfDigits, removeTrailingZeros )   //Convert value to a string where the number of digits in the string
### Example
    nrOfDigits == 4:
    1.2345  => "1.234"
    12.345  => "12.34"
    123.45  => "123.4"
    1234.5  => "1235"
    12345   => "12345"
    
    removeTrailingZeros = false: 1.2 => "1.200"
    removeTrailingZeros = true : 1.2 => "1.2"


## Formats
The following formats are defined. 
Some formats have additional options. They are all optional.

For the formats `length`, `area`, and `speed` the output is 


| id | input | Output ex. | Options (id/default/description) |
| :--: | :--: | --- | --- |
| `number`| `{number}` | `"1,000.123"` | `decimals` / `2` / Number of decimals. If the number is a integer no decimals are displayed<br>`format`, `"0,0[.]00"`, The [numeral.js] format used.|
| `length`| `{number}` | `"12.3 nm"` | `removeTrailingZeros` / `true` / Convert input as meter to m, km or nm according to the setting `length` using `numberFixedWidth`<br><br>`withUnitLink` / `false` / If `true` the unit contain a link to `globalSetting.edit` |
| `area`| `{number}` | `"1234 m2"` | `removeTrailingZeros` / `true` / Convert input as square meter to m2, km2 or nm2 according to the setting `area` using `numberFixedWidth`<br><br>`withUnitLink` (see above)  |
| `speed`| `{number}` | `"12.3 km/h"` | `removeTrailingZeros` / `true` / Convert input as speed (m/s) to m/s, km/h or knots according to the setting `speed` using `numberFixedWidth` |
| `direction`| `{number}` | `"380 rad"` | Convert input as direction (0-360) to direction or radian (0-400) according to the setting `direction`<br><br>`withUnitLink` (see above)  |
| `length_unit`| `none` | `"nm"` | Return the current length-unit with a link to `globalSetting.edit` |
| `area_unit`| `none` | `"nm2"` | Return the current area-unit with a link to `globalSetting.edit` |
| `speed_unit`| `none` | `"km/h"` | Return the current speed-unit with a link to `globalSetting.edit` |
| `direction_unit`| `none` | `"Degree (0-360)'"` | Return the current direction-unit with a link to `globalSetting.edit` |
| `latlng` | `[lat, lng]` | `"55°07'11.9"N 13°07'22.7"E"` | `separator` / `" "` / Text or html-code between the lat and lng. E.g. `"<br>"` |
| `time` | `moment/string` | `"14:00"` | |
| `hour` | `moment/string` | `"14"` | |
| `time_utc` | `moment/string` | `"13:00"` | |
| `hour_utc` | `moment/string` | `"13"` | |
| `time_local` | `moment/string` | `"12:00"` | |
| `hour_local` | `moment/string` | `"12"` | |
| `date` | `moment/string` | `"25. Jan 2017"` | |
| `date_weekday` | `moment/string` | `"Wednesday, 25. Jan 2017"` | |
| `date_long` | `moment/string` | `"25. January 2017"` | |
| `date_long_weekday` | `moment/string` | `"Wednesday, 25. January 2017"` | |
| `date_short` | `moment/string` | `"25/01/17"` | |
| `date_utc` | `moment/string` | `"25. Jan 2017"` | |
| `date_weekday_utc` | `moment/string` | `"Wednesday, 25. Jan 2017"` | |
| `date_long_utc` | `moment/string` | `"25. January 2017"` | |
| `date_long_weekday_utc` | `moment/string` | `"Wednesday, 25. January 2017"` | |
| `date_short_utc` | `moment/string` | `"25/01/17"` | |
| `date_format_utc` | `moment/string` | `"25. Jan 2017"` | |
| `date_local` | `moment/string` | `"25. Jan 2017"` | |
| `date_weekday_local` | `moment/string` | `"Wednesday, 25. Jan 2017"` | |
| `date_long_local` | `moment/string` | `"25. January 2017"` | |
| `date_long_weekday_local` | `moment/string` | `"Wednesday, 25. January 2017"` | |
| `date_short_local` | `moment/string` | `"25/01/17"` | |
| `date_format_local` | `moment/string` | `"25. Jan 2017"` | |
| `datetime` | `moment/string` | `"25. Jan 2017 14:00"` | |
| `datetime_weekday` | `moment/string` | `"Wednesday, 25. Jan 2017 14:00"` | |
| `datetime_long` | `moment/string` | `"25. January 2017 14:00"` | |
| `datetime_long_weekday` | `moment/string` | `"Wednesday, 25. January 2017 14:00"` | |
| `datetime_short` | `moment/string` | `"25/01/17 14:00"` | |
| `datetime_utc` | `moment/string` | `"25. Jan 2017 13:00"` | |
| `datetime_weekday_utc` | `moment/string` | `"Wednesday, 25. Jan 2017 13:00"` | |
| `datetime_long_utc` | `moment/string` | `"25. January 2017 13:00"` | |
| `datetime_long_weekday_utc` | `moment/string` | `"Wednesday, 25. January 2017 13:00"` | |
| `datetime_short_utc` | `moment/string` | `"25/01/17 13:00"` | |
| `datetime_format_utc` | `moment/string` | `"25. Jan 2017 13:00"` | |
| `datetime_local` | `moment/string` | `"25. Jan 2017 12:00"` | |
| `datetime_weekday_local` | `moment/string` | `"Wednesday, 25. Jan 2017 12:00"` | |
| `datetime_long_local` | `moment/string` | `"25. January 2017 12:00"` | |
| `datetime_long_weekday_local` | `moment/string` | `"Wednesday, 25. January 2017 12:00"` | |
| `datetime_short_local` | `moment/string` | `"25/01/17 12:00"` | |
| `datetime_format_local` | `moment/string` | `"25. Jan 2017 12:00"` | |
| `timezone` | `moment/string` | `"Europe/Copenhagen"` | |
| `timezone_full` | `moment/string` | `"Europe/Copenhagen (UTC+01:00)"` | |
| `relative` | `moment/string` | `"now+2d3h"` | |
| `relative_m` | `moment/string` | `"now+3070m"` | |
| `relative_h` | `moment/string` | `"now+51h"` | |
| `relative_d` | `moment/string` | `"now+2d"` | |
| `relative_hm` | `moment/string` | `"now+51h10m"` | |
| `relative_dh` | `moment/string` | `"now+2d3h"` | |
| `relative_dhm` | `moment/string` | `"now+2d3h10m"` | |
| `time_utc_sup` | `moment/string` | `"05:33<sup>+1</sup>"` | time of utc with sup of day-different from moment in current timezone |
| `time_now_sup` | `moment/string` | `"05:33<sup>+1</sup>"` | time of current tz with sup of day-different to now (same tz) |
| `time_other_sup` | `moment/string` | `"05:33<sup>+1</sup>"` | time of current tz with sup of day-different to another moment given in options.other (same tz) |




### Input to date- and time-formats
All formats for time or date takes input as moment-object or as string with the time/date as ISO 8601 format

### Formats for objects
If the "value" of the element is a object (`L.latLng` or `moment`) a copy of the object is saved and the original object can be altered without changing the contents of the element

### Formats for `moment`
- `_utc`   : The displayed moment is in UTC
- `_local` : The displayed moment is in local time
- `_short` : The moment is displayed in a short format
- `_long`  : The moment is displayed in a long format


## Usage

    //Return a div-element with the value 1000.123 formated to selected number-format (e.g. "1,000.123")
    $('<div></div>').vfValueFormat( 1000.123, 'number' ); 
    
    //Return a div-element with the moment-object myMoment formated to selected date-format in current timezone (e.g. "30. jan 17")
    $('<div></div>').vfValueFormat( myMoment, 'date' ); 

    //Create a moment-obj with current time in selected format
    var currentMoment = moment();
    $('<div id="current-time"></div>')
        .vfValueFormat( currentMoment, 'time', {saveAsMoment: true} ); 

    window.setInterval(function(){ 
        //Update currentMoment with current time...
        $('#current-time").vfUpdate();    
    }, 60*1000);





## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/fcoo-value-format/LICENSE).

Copyright (c) 2017 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk
