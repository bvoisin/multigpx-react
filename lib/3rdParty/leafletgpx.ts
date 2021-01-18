/*
 Copied from https://github.com/mpetazzoni/leaflet-gpx/commit/98772565059f832326bb4d7594b5c0bdfd0aa94d#diff-f601295f690a4d4f6a68feed4606721379df78d3f8ccc293d8938ab4a9cb7979
 to add link support
 */
/**
 * Copyright (C) 2011-2012 Pavel Shramov
 * Copyright (C) 2013-2017 Maxime Petazzoni <maxime.petazzoni@bulix.org>
 * All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * Thanks to Pavel Shramov who provided the initial implementation and Leaflet
 * integration. Original code was at https://github.com/shramov/leaflet-plugins.
 *
 * It was then cleaned-up and modified to record and make available more
 * information about the GPX track while it is being parsed so that the result
 * can be used to display additional information about the track that is
 * rendered on the Leaflet map.
 */

import L, {MarkerOptions} from 'leaflet';

const _MAX_POINT_INTERVAL_MS = 15000;
const _SECOND_IN_MILLIS = 1000;
const _MINUTE_IN_MILLIS = 60 * _SECOND_IN_MILLIS;
const _HOUR_IN_MILLIS = 60 * _MINUTE_IN_MILLIS;
const _DAY_IN_MILLIS = 24 * _HOUR_IN_MILLIS;

const _GPX_STYLE_NS = 'http://www.topografix.com/GPX/gpx_style/0/2';

const _DEFAULT_MARKER_OPTS = {
    startIconUrl: 'pin-icon-start.png',
    endIconUrl: 'pin-icon-end.png',
    shadowUrl: 'pin-shadow.png',
    wptIcons: [],
    wptIconsType: [],
    wptIconUrls: {
        '': 'pin-icon-wpt.png',
    },
    wptIconTypeUrls: {
        '': 'pin-icon-wpt.png',
    },
    pointMatchers: [],
    iconSize: [33, 50],
    shadowSize: [50, 50],
    iconAnchor: [16, 45],
    shadowAnchor: [16, 47],
    clickable: false
};
const _DEFAULT_POLYLINE_OPTS = {
    color: 'blue'
};
const _DEFAULT_GPX_OPTS = {
    parseElements: ['track', 'route', 'waypoint'],
    joinTrackSegments: true
};

const L_GPX = L.FeatureGroup.extend({
    initialize: function (gpx, options) {
        options.max_point_interval = options.max_point_interval || _MAX_POINT_INTERVAL_MS;
        options.marker_options = this._merge_objs(
            _DEFAULT_MARKER_OPTS,
            options.marker_options || {});
        options.polyline_options = options.polyline_options || {};
        options.gpx_options = this._merge_objs(
            _DEFAULT_GPX_OPTS,
            options.gpx_options || {});

        L.Util.setOptions(this, options);

        // Base icon class for track pins.
        L['GPXTrackIcon'] = L.Icon.extend({options: options.marker_options});

        this._gpx = gpx;
        this._layers = {};
        this._init_info();

        if (gpx) {
            this._parse(gpx, options, this.options.async);
        }
    },

    get_duration_string: function (duration, hidems) {
        let s = '';

        if (duration >= _DAY_IN_MILLIS) {
            s += Math.floor(duration / _DAY_IN_MILLIS) + 'd ';
            duration = duration % _DAY_IN_MILLIS;
        }

        if (duration >= _HOUR_IN_MILLIS) {
            s += Math.floor(duration / _HOUR_IN_MILLIS) + ':';
            duration = duration % _HOUR_IN_MILLIS;
        }

        const mins = Math.floor(duration / _MINUTE_IN_MILLIS);
        duration = duration % _MINUTE_IN_MILLIS;
        if (mins < 10) s += '0';
        s += mins + '\'';

        const secs = Math.floor(duration / _SECOND_IN_MILLIS);
        duration = duration % _SECOND_IN_MILLIS;
        if (secs < 10) s += '0';
        s += secs;

        if (!hidems && duration > 0) s += '.' + Math.round(Math.floor(duration) * 1000) / 1000;
        else s += '"';

        return s;
    },

    get_duration_string_iso: function (duration, hidems) {
        const s = this.get_duration_string(duration, hidems);
        return s.replace('\'', ':').replace('"', '');
    },

    // Public methods
    to_miles: function (v) {
        return v / 1.60934;
    },
    to_ft: function (v) {
        return v * 3.28084;
    },
    m_to_km: function (v) {
        return v / 1000;
    },
    m_to_mi: function (v) {
        return v / 1609.34;
    },

    get_name: function () {
        return this._info.name;
    },
    get_desc: function () {
        return this._info.desc;
    },
    get_author: function () {
        return this._info.author;
    },
    get_link: function () {
        return this._info.link;
    },
    get_copyright: function () {
        return this._info.copyright;
    },
    get_distance: function () {
        return this._info.length;
    },
    get_distance_imp: function () {
        return this.to_miles(this.m_to_km(this.get_distance()));
    },

    get_start_time: function () {
        return this._info.duration.start;
    },
    get_end_time: function () {
        return this._info.duration.end;
    },
    get_moving_time: function () {
        return this._info.duration.moving;
    },
    get_total_time: function () {
        return this._info.duration.total;
    },

    get_moving_pace: function () {
        return this.get_moving_time() / this.m_to_km(this.get_distance());
    },
    get_moving_pace_imp: function () {
        return this.get_moving_time() / this.get_distance_imp();
    },

    get_moving_speed: function () {
        return this.m_to_km(this.get_distance()) / (this.get_moving_time() / (3600 * 1000));
    },
    get_moving_speed_imp: function () {
        return this.to_miles(this.m_to_km(this.get_distance())) / (this.get_moving_time() / (3600 * 1000));
    },

    get_total_speed: function () {
        return this.m_to_km(this.get_distance()) / (this.get_total_time() / (3600 * 1000));
    },
    get_total_speed_imp: function () {
        return this.to_miles(this.m_to_km(this.get_distance())) / (this.get_total_time() / (3600 * 1000));
    },

    get_elevation_gain: function () {
        return this._info.elevation.gain;
    },
    get_elevation_loss: function () {
        return this._info.elevation.loss;
    },
    get_elevation_gain_imp: function () {
        return this.to_ft(this.get_elevation_gain());
    },
    get_elevation_loss_imp: function () {
        return this.to_ft(this.get_elevation_loss());
    },
    get_elevation_data: function () {
        const _this = this;
        return this._info.elevation._points.map(
            function (p) {
                return _this._prepare_data_point(p, _this.m_to_km, null,
                    function (a, b) {
                        return a.toFixed(2) + ' km, ' + b.toFixed(0) + ' m';
                    });
            });
    },
    get_elevation_data_imp: function () {
        const _this = this;
        return this._info.elevation._points.map(
            function (p) {
                return _this._prepare_data_point(p, _this.m_to_mi, _this.to_ft,
                    function (a, b) {
                        return a.toFixed(2) + ' mi, ' + b.toFixed(0) + ' ft';
                    });
            });
    },
    get_elevation_max: function () {
        return this._info.elevation.max;
    },
    get_elevation_min: function () {
        return this._info.elevation.min;
    },
    get_elevation_max_imp: function () {
        return this.to_ft(this.get_elevation_max());
    },
    get_elevation_min_imp: function () {
        return this.to_ft(this.get_elevation_min());
    },

    get_average_hr: function () {
        return this._info.hr.avg;
    },
    get_average_temp: function () {
        return this._info.atemp.avg;
    },
    get_average_cadence: function () {
        return this._info.cad.avg;
    },
    get_heartrate_data: function () {
        const _this = this;
        return this._info.hr._points.map(
            function (p) {
                return _this._prepare_data_point(p, _this.m_to_km, null,
                    function (a, b) {
                        return a.toFixed(2) + ' km, ' + b.toFixed(0) + ' bpm';
                    });
            });
    },
    get_heartrate_data_imp: function () {
        const _this = this;
        return this._info.hr._points.map(
            function (p) {
                return _this._prepare_data_point(p, _this.m_to_mi, null,
                    function (a, b) {
                        return a.toFixed(2) + ' mi, ' + b.toFixed(0) + ' bpm';
                    });
            });
    },
    get_cadence_data: function () {
        const _this = this;
        return this._info.cad._points.map(
            function (p) {
                return _this._prepare_data_point(p, _this.m_to_km, null,
                    function (a, b) {
                        return a.toFixed(2) + ' km, ' + b.toFixed(0) + ' rpm';
                    });
            });
    },
    get_temp_data: function () {
        const _this = this;
        return this._info.atemp._points.map(
            function (p) {
                return _this._prepare_data_point(p, _this.m_to_km, null,
                    function (a, b) {
                        return a.toFixed(2) + ' km, ' + b.toFixed(0) + ' degrees';
                    });
            });
    },
    get_cadence_data_imp: function () {
        const _this = this;
        return this._info.cad._points.map(
            function (p) {
                return _this._prepare_data_point(p, _this.m_to_mi, null,
                    function (a, b) {
                        return a.toFixed(2) + ' mi, ' + b.toFixed(0) + ' rpm';
                    });
            });
    },
    get_temp_data_imp: function () {
        const _this = this;
        return this._info.atemp._points.map(
            function (p) {
                return _this._prepare_data_point(p, _this.m_to_mi, null,
                    function (a, b) {
                        return a.toFixed(2) + ' mi, ' + b.toFixed(0) + ' degrees';
                    });
            });
    },

    reload: function () {
        this._init_info();
        this.clearLayers();
        this._parse(this._gpx, this.options, this.options.async);
    },

    // Private methods
    _merge_objs: function (a, b) {
        const _ = {};
        for (const attr in a) {
            // noinspection JSUnfilteredForInLoop
            _[attr] = a[attr];
        }
        for (const attr in b) {
            // noinspection JSUnfilteredForInLoop
            _[attr] = b[attr];
        }
        return _;
    },

    _prepare_data_point: function (p, trans1, trans2, trans_tooltip) {
        const r = [trans1 && trans1(p[0]) || p[0], trans2 && trans2(p[1]) || p[1]];
        r.push(trans_tooltip && trans_tooltip(r[0], r[1]) || (r[0] + ': ' + r[1]));
        return r;
    },

    _init_info: function () {
        this._info = {
            name: null,
            length: 0.0,
            elevation: {gain: 0.0, loss: 0.0, max: 0.0, min: Infinity, _points: []},
            hr: {avg: 0, _total: 0, _points: []},
            duration: {start: null, end: null, moving: 0, total: 0},
            atemp: {avg: 0, _total: 0, _points: []},
            cad: {avg: 0, _total: 0, _points: []}
        };
    },

    _load_xml: function (url, cb, options, async) {
        if (async == undefined) async = this.options.async;
        if (options == undefined) options = this.options;

        const req = new window.XMLHttpRequest();
        req.open('GET', url, async);
        try {
            req.overrideMimeType('text/xml'); // unsupported by IE
        } catch (e) {
        }
        req.onreadystatechange = function () {
            if (req.readyState != 4) return;
            if (req.status == 200) cb(req.responseXML, options);
        };
        req.send(null);
    },

    _parse: function (input, options, async) {
        const _this = this;
        const cb = function (gpx, options) {
            const layers = _this._parse_gpx_data(gpx, options);
            if (!layers) {
                _this.fire('error', {err: 'No parseable layers of type(s) ' + JSON.stringify(options.gpx_options.parseElements)});
                return;
            }
            _this.addLayer(layers);
            _this.fire('loaded', {layers: layers, element: gpx});
        }
        if (input instanceof Document) {
            if (async) {
                setTimeout(function () {
                    cb(input, options);
                });
            } else {
                cb(input, options);
            }
        } else if (input.substr(0, 1) === '<') { // direct XML has to start with a <
            const parser = new DOMParser();
            if (async) {
                setTimeout(function () {
                    cb(parser.parseFromString(input, 'text/xml'), options);
                });
            } else {
                cb(parser.parseFromString(input, 'text/xml'), options);
            }
        } else {
            this._load_xml(input, cb, options, async);
        }
    },

    _parse_gpx_data: function (xml, options) {
        let i, t, l, el, layers = [];

        const name = xml.getElementsByTagName('name');
        if (name.length > 0) {
            this._info.name = name[0].textContent;
        }
        const desc = xml.getElementsByTagName('desc');
        if (desc.length > 0) {
            this._info.desc = desc[0].textContent;
        }
        const author = xml.getElementsByTagName('author');
        if (author.length > 0) {
            const name = author[0].getElementsByTagName('name')
            if (name.length > 0) {
                this._info.author = name[0].textContent;
            } else {
                this._info.author = author[0].textContent;
            }
        }
        const copyright = xml.getElementsByTagName('copyright');
        if (copyright.length > 0) {
            this._info.copyright = copyright[0].textContent;
        }

        const trk = xml.getElementsByTagName('trk')[0] || xml.getElementsByTagName('route')[0];
        const link = trk.getElementsByTagName('link?')[0] || xml.getElementsByTagName('link?')[0];
        if (link) {
            this._info.link = link.attributes['href'].textContent;
        }

        const parseElements = options.gpx_options.parseElements;
        if (parseElements.indexOf('route') > -1) {
            // routes are <rtept> tags inside <rte> sections
            const routes = xml.getElementsByTagName('rte');
            for (i = 0; i < routes.length; i++) {
                layers = layers.concat(this._parse_segment(routes[i], options, {}, 'rtept'));
            }
        }

        if (parseElements.indexOf('track') > -1) {
            // tracks are <trkpt> tags in one or more <trkseg> sections in each <trk>
            const tracks = xml.getElementsByTagName('trk');
            for (i = 0; i < tracks.length; i++) {
                const track = tracks[i];
                const polyline_options = this._extract_styling(track);

                if (options.gpx_options.joinTrackSegments) {
                    layers = layers.concat(this._parse_segment(track, options, polyline_options, 'trkpt'));
                } else {
                    const segments = track.getElementsByTagName('trkseg');
                    for (let j = 0; j < segments.length; j++) {
                        layers = layers.concat(this._parse_segment(segments[j], options, polyline_options, 'trkpt'));
                    }
                }
            }
        }

        this._info.hr.avg = Math.round(this._info.hr._total / this._info.hr._points.length);
        this._info.cad.avg = Math.round(this._info.cad._total / this._info.cad._points.length);
        this._info.atemp.avg = Math.round(this._info.atemp._total / this._info.atemp._points.length);

        // parse waypoints and add markers for each of them
        if (parseElements.indexOf('waypoint') > -1) {
            el = xml.getElementsByTagName('wpt');
            for (i = 0; i < el.length; i++) {
                const ll = new L.LatLng(
                    el[i].getAttribute('lat'),
                    el[i].getAttribute('lon'));

                const nameEl = el[i].getElementsByTagName('name');
                let name = '';
                if (nameEl.length > 0) {
                    name = nameEl[0].textContent;
                }

                const descEl = el[i].getElementsByTagName('desc');
                let desc = '';
                if (descEl.length > 0) {
                    desc = descEl[0].textContent;
                }

                const symEl = el[i].getElementsByTagName('sym');
                let symKey = '';
                if (symEl.length > 0) {
                    symKey = symEl[0].textContent;
                }

                const typeEl = el[i].getElementsByTagName('type');
                let typeKey = '';
                if (typeEl.length > 0) {
                    typeKey = typeEl[0].textContent;
                }

                /*
                 * Add waypoint marker based on the waypoint symbol key.
                 *
                 * First look for a configured icon for that symKey. If not found, look
                 * for a configured icon URL for that symKey and build an icon from it.
                 * Otherwise, fall back to the default icon if one was configured, or
                 * finally to the default icon URL.
                 */
                const wptIcons = options.marker_options.wptIcons;
                const wptIconUrls = options.marker_options.wptIconUrls;
                const wptIconsType = options.marker_options.wptIconsType;
                const wptIconTypeUrls = options.marker_options.wptIconTypeUrls;
                let symIcon;
                if (wptIcons && wptIcons[symKey]) {
                    symIcon = wptIcons[symKey];
                } else if (wptIconsType && wptIconsType[typeKey]) {
                    symIcon = wptIconsType[typeKey];
                } else if (wptIconUrls && wptIconUrls[symKey]) {
                    symIcon = new L['GPXTrackIcon']({iconUrl: wptIconUrls[symKey]});
                } else if (wptIconTypeUrls && wptIconTypeUrls[typeKey]) {
                    symIcon = new L['GPXTrackIcon']({iconUrl: wptIconTypeUrls[typeKey]});
                } else if (wptIcons && wptIcons['']) {
                    symIcon = wptIcons[''];
                } else if (wptIconUrls && wptIconUrls['']) {
                    symIcon = new L['GPXTrackIcon']({iconUrl: wptIconUrls['']});
                } else {
                    console.log('No icon or icon URL configured for symbol type "' + symKey
                        + '", and no fallback configured; ignoring waypoint.');
                    continue;
                }

                const marker = new L.Marker(ll, {
                    clickable: options.marker_options.clickable,
                    title: name,
                    icon: symIcon,
                    type: 'waypoint'
                } as MarkerOptions);
                marker.bindPopup('<b>' + name + '</b>' + (desc.length > 0 ? '<br>' + desc : '')).openPopup();
                this.fire('addpoint', {point: marker, point_type: 'waypoint', element: el[i]});
                layers.push(marker);
            }
        }

        if (layers.length > 1) {
            return new L.FeatureGroup(layers);
        } else if (layers.length == 1) {
            return layers[0];
        }
    },

    _parse_segment: function (line, options, polyline_options, tag) {
        const el = line.getElementsByTagName(tag);
        if (!el.length) return [];

        const coords = [];
        const markers = [];
        const layers = [];
        let last = null;

        for (let i = 0; i < el.length; i++) {
            let _, ll = new L.LatLng(
                el[i].getAttribute('lat'),
                el[i].getAttribute('lon'));
            ll['meta'] = {time: null, ele: null, hr: null, cad: null, atemp: null};

            _ = el[i].getElementsByTagName('time');
            if (_.length > 0) {
                ll['meta'].time = new Date(Date.parse(_[0].textContent));
            } else {
                ll['meta'].time = new Date('1970-01-01T00:00:00');
            }

            _ = el[i].getElementsByTagName('ele');
            if (_.length > 0) {
                ll['meta'].ele = parseFloat(_[0].textContent);
            }

            _ = el[i].getElementsByTagName('name');
            if (_.length > 0) {
                const name = _[0].textContent;
                const ptMatchers = options.marker_options.pointMatchers || [];

                for (let j = 0; j < ptMatchers.length; j++) {
                    if (ptMatchers[j].regex.test(name)) {
                        markers.push({label: name, coords: ll, icon: ptMatchers[j].icon, element: el[i]});
                        break;
                    }
                }
            }

            _ = el[i].getElementsByTagNameNS('*', 'hr');
            if (_.length > 0) {
                ll['meta'].hr = parseInt(_[0].textContent);
                this._info.hr._points.push([this._info.length, ll['meta'].hr]);
                this._info.hr._total += ll['meta'].hr;
            }

            _ = el[i].getElementsByTagNameNS('*', 'cad');
            if (_.length > 0) {
                ll['meta'].cad = parseInt(_[0].textContent);
                this._info.cad._points.push([this._info.length, ll['meta'].cad]);
                this._info.cad._total += ll['meta'].cad;
            }

            _ = el[i].getElementsByTagNameNS('*', 'atemp');
            if (_.length > 0) {
                ll['meta'].atemp = parseInt(_[0].textContent);
                this._info.atemp._points.push([this._info.length, ll['meta'].atemp]);
                this._info.atemp._total += ll['meta'].atemp;
            }

            if (ll['meta'].ele > this._info.elevation.max) {
                this._info.elevation.max = ll['meta'].ele;
            }

            if (ll['meta'].ele < this._info.elevation.min) {
                this._info.elevation.min = ll['meta'].ele;
            }

            this._info.elevation._points.push([this._info.length, ll['meta'].ele]);
            this._info.duration.end = ll['meta'].time;

            if (last != null) {
                this._info.length += this._dist3d(last, ll);

                let t = ll['meta'].ele - last['meta'].ele;
                if (t > 0) {
                    this._info.elevation.gain += t;
                } else {
                    this._info.elevation.loss += Math.abs(t);
                }

                t = Math.abs(ll['meta'].time - last['meta'].time);
                this._info.duration.total += t;
                if (t < options.max_point_interval) {
                    this._info.duration.moving += t;
                }
            } else if (this._info.duration.start == null) {
                this._info.duration.start = ll['meta'].time;
            }

            last = ll;
            coords.push(ll);
        }

        // add track
        const l = new L.Polyline(coords, this._extract_styling(line, polyline_options, options.polyline_options));
        this.fire('addline', {line: l, element: line});
        layers.push(l);

        if (options.marker_options.startIcon || options.marker_options.startIconUrl) {
            // add start pin
            const marker = new L.Marker(coords[0], {
                clickable: options.marker_options.clickable,
                icon: options.marker_options.startIcon || new L['GPXTrackIcon']({iconUrl: options.marker_options.startIconUrl})
            } as MarkerOptions);
            this.fire('addpoint', {point: marker, point_type: 'start', element: el[0]});
            layers.push(marker);
        }

        if (options.marker_options.endIcon || options.marker_options.endIconUrl) {
            // add end pin
            const marker = new L.Marker(coords[coords.length - 1], {
                clickable: options.marker_options.clickable,
                icon: options.marker_options.endIcon || new L['GPXTrackIcon']({iconUrl: options.marker_options.endIconUrl})
            } as MarkerOptions);
            this.fire('addpoint', {point: marker, point_type: 'end', element: el[el.length - 1]});
            layers.push(marker);
        }

        // add named markers
        for (let i = 0; i < markers.length; i++) {
            const marker = new L.Marker(markers[i].coords, {
                clickable: options.marker_options.clickable,
                title: markers[i].label,
                icon: markers[i].icon
            } as MarkerOptions);
            this.fire('addpoint', {point: marker, point_type: 'label', element: markers[i].element});
            layers.push(marker);
        }

        return layers;
    },

    _extract_styling: function (el, base, overrides) {
        const style = this._merge_objs(_DEFAULT_POLYLINE_OPTS, base);
        const e = el.getElementsByTagNameNS(_GPX_STYLE_NS, 'line');
        if (e.length > 0) {
            let _ = e[0].getElementsByTagName('color');
            if (_.length > 0) style.color = '#' + _[0].textContent;
            _ = e[0].getElementsByTagName('opacity');
            if (_.length > 0) style.opacity = _[0].textContent;
            _ = e[0].getElementsByTagName('weight');
            if (_.length > 0) style.weight = _[0].textContent;
            _ = e[0].getElementsByTagName('linecap');
            if (_.length > 0) style.lineCap = _[0].textContent;
        }
        return this._merge_objs(style, overrides)
    },

    _dist2d: function (a, b) {
        const R = 6371000;
        const dLat = this._deg2rad(b.lat - a.lat);
        const dLon = this._deg2rad(b.lng - a.lng);
        const r = Math.sin(dLat / 2) *
            Math.sin(dLat / 2) +
            Math.cos(this._deg2rad(a.lat)) *
            Math.cos(this._deg2rad(b.lat)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(r), Math.sqrt(1 - r));
        return R * c;
    },

    _dist3d: function (a, b) {
        const planar = this._dist2d(a, b);
        const height = Math.abs(b['meta'].ele - a['meta'].ele);
        return Math.sqrt(Math.pow(planar, 2) + Math.pow(height, 2));
    },

    _deg2rad: function (deg) {
        return deg * Math.PI / 180;
    }
});

type C_LGPX = (new (gpx, options) => (typeof L_GPX))

export function createLeafletGpx(gpx: string | Document, options): L.FeatureGroup {
    const lgpx = new (L_GPX as C_LGPX)(gpx, options);
    return lgpx as any as L.FeatureGroup;
}