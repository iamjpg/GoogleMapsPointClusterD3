/*
 OverlappingMarkerSpiderfier
https://github.com/jawj/OverlappingMarkerSpiderfier
Copyright (c) 2011 - 2013 George MacKerron
Released under the MIT licence: http://opensource.org/licenses/mit-license
Note: The Google Maps API v3 must be included *before* this code
*/
var y = {}.hasOwnProperty,
  z = [].slice;
var OverlappingMarkerSpiderfier = function() {
  function v(b, d) {
    var a, g, e, f;
    this.map = b;
    null == d && (d = {});
    for (a in d) y.call(d, a) && (g = d[a], this[a] = g);
    this.e = new this.constructor.g(this.map);
    this.n();
    this.b = {};
    f = ["click", "zoom_changed", "maptypeid_changed"];
    g = 0;
    for (e = f.length; g < e; g++) a = f[g], q.addListener(this.map, a, function(a) {
      return function() {
        return a.unspiderfy()
      }
    }(this))
  }
  var q, t, u, s, r, c, w, x;
  c = v.prototype;
  x = [v, c];
  s = 0;
  for (r = x.length; s < r; s++) u = x[s], u.VERSION = "0.3.3";
  t = google.maps;
  q = t.event;
  r = t.MapTypeId;
  w =
    2 * Math.PI;
  c.keepSpiderfied = !1;
  c.markersWontHide = !1;
  c.markersWontMove = !1;
  c.nearbyDistance = 20;
  c.circleSpiralSwitchover = 9;
  c.circleFootSeparation = 23;
  c.circleStartAngle = w / 12;
  c.spiralFootSeparation = 26;
  c.spiralLengthStart = 11;
  c.spiralLengthFactor = 4;
  c.spiderfiedZIndex = 1E3;
  c.usualLegZIndex = 10;
  c.highlightedLegZIndex = 20;
  c.event = "click";
  c.minZoomLevel = !1;
  c.legWeight = 1.5;
  c.legColors = {
    usual: {},
    highlighted: {}
  };
  s = c.legColors.usual;
  u = c.legColors.highlighted;
  s[r.HYBRID] = s[r.SATELLITE] = "#fff";
  u[r.HYBRID] = u[r.SATELLITE] =
    "#f00";
  s[r.TERRAIN] = s[r.ROADMAP] = "#444";
  u[r.TERRAIN] = u[r.ROADMAP] = "#f00";
  c.n = function() {
    this.a = [];
    this.j = []
  };
  c.addMarker = function(b) {
    var d;
    if (null != b._oms) return this;
    b._oms = !0;
    d = [q.addListener(b, this.event, function(a) {
      return function(d) {
        return a.G(b, d)
      }
    }(this))];
    this.markersWontHide || d.push(q.addListener(b, "visible_changed", function(a) {
      return function() {
        return a.o(b, !1)
      }
    }(this)));
    this.markersWontMove || d.push(q.addListener(b, "position_changed", function(a) {
      return function() {
        return a.o(b, !0)
      }
    }(this)));
    this.j.push(d);
    this.a.push(b);
    return this
  };
  c.o = function(b, d) {
    if (null != b._omsData && (d || !b.getVisible()) && null == this.s && null == this.t) return this.unspiderfy(d ? b : null)
  };
  c.getMarkers = function() {
    return this.a.slice(0)
  };
  c.removeMarker = function(b) {
    var d, a, g, e, f;
    null != b._omsData && this.unspiderfy();
    d = this.m(this.a, b);
    if (0 > d) return this;
    g = this.j.splice(d, 1)[0];
    e = 0;
    for (f = g.length; e < f; e++) a = g[e], q.removeListener(a);
    delete b._oms;
    this.a.splice(d, 1);
    return this
  };
  c.clearMarkers = function() {
    var b, d, a, g, e, f, c, h;
    this.unspiderfy();
    h = this.a;
    b = g = 0;
    for (f = h.length; g < f; b = ++g) {
      a = h[b];
      d = this.j[b];
      e = 0;
      for (c = d.length; e < c; e++) b = d[e], q.removeListener(b);
      delete a._oms
    }
    this.n();
    return this
  };
  c.addListener = function(b, d) {
    var a;
    (null != (a = this.b)[b] ? a[b] : a[b] = []).push(d);
    return this
  };
  c.removeListener = function(b, d) {
    var a;
    a = this.m(this.b[b], d);
    0 > a || this.b[b].splice(a, 1);
    return this
  };
  c.clearListeners = function(b) {
    this.b[b] = [];
    return this
  };
  c.trigger = function() {
    var b, d, a, g, e, f;
    d = arguments[0];
    b = 2 <= arguments.length ? z.call(arguments, 1) : [];
    d = null != (a =
      this.b[d]) ? a : [];
    f = [];
    g = 0;
    for (e = d.length; g < e; g++) a = d[g], f.push(a.apply(null, b));
    return f
  };
  c.u = function(b, d) {
    var a, g, e, f, c;
    e = this.circleFootSeparation * (2 + b) / w;
    g = w / b;
    c = [];
    for (a = f = 0; 0 <= b ? f < b : f > b; a = 0 <= b ? ++f : --f) a = this.circleStartAngle + a * g, c.push(new t.Point(d.x + e * Math.cos(a), d.y + e * Math.sin(a)));
    return c
  };
  c.v = function(b, d) {
    var a, g, e, f, c;
    e = this.spiralLengthStart;
    a = 0;
    c = [];
    for (g = f = 0; 0 <= b ? f < b : f > b; g = 0 <= b ? ++f : --f) a += this.spiralFootSeparation / e + 5E-4 * g, g = new t.Point(d.x + e * Math.cos(a), d.y + e * Math.sin(a)), e += w * this.spiralLengthFactor /
      a, c.push(g);
    return c
  };
  c.G = function(b, d) {
    var a, g, e, f, p, h, k, n, l, m;
    h = null != b._omsData;
    h && this.keepSpiderfied || ("mouseover" === this.event ? (a = this, g = function() {
      return a.unspiderfy()
    }, window.clearTimeout(c.timeout), c.timeout = setTimeout(g, 3E3)) : this.unspiderfy());
    if (h || this.map.getStreetView().getVisible() || "GoogleEarthAPI" === this.map.getMapTypeId()) return this.trigger("click", b, d);
    g = [];
    h = [];
    e = this.nearbyDistance;
    k = e * e;
    p = this.c(b.position);
    m = this.a;
    n = 0;
    for (l = m.length; n < l; n++) e = m[n], null != e.map && e.getVisible() &&
      (f = this.c(e.position), this.f(f, p) < k ? g.push({
        B: e,
        p: f
      }) : h.push(e));
    return 1 === g.length ? this.trigger("click", b, d) : this.H(g, h)
  };
  c.markersNearMarker = function(b, d) {
    var a, g, e, f, c, h, k, n, l, m;
    null == d && (d = !1);
    if (null == this.e.getProjection()) throw "Must wait for 'idle' event on map before calling markersNearMarker";
    a = this.nearbyDistance;
    c = a * a;
    e = this.c(b.position);
    f = [];
    n = this.a;
    h = 0;
    for (k = n.length; h < k && !(a = n[h], a !== b && null != a.map && a.getVisible() && (g = this.c(null != (l = null != (m = a._omsData) ? m.l : void 0) ? l : a.position),
        this.f(g, e) < c && (f.push(a), d))); h++);
    return f
  };
  c.markersNearAnyOtherMarker = function() {
    var b, d, a, g, e, f, c, h, k, n, l, m;
    if (null == this.e.getProjection()) throw "Must wait for 'idle' event on map before calling markersNearAnyOtherMarker";
    f = this.nearbyDistance;
    b = f * f;
    g = this.a;
    f = [];
    l = 0;
    for (a = g.length; l < a; l++) d = g[l], f.push({
      q: this.c(null != (c = null != (k = d._omsData) ? k.l : void 0) ? c : d.position),
      d: !1
    });
    l = this.a;
    d = c = 0;
    for (k = l.length; c < k; d = ++c)
      if (a = l[d], null != a.map && a.getVisible() && (g = f[d], !g.d))
        for (m = this.a, a = h = 0, n = m.length; h <
          n; a = ++h)
          if (e = m[a], a !== d && null != e.map && e.getVisible() && (e = f[a], (!(a < d) || e.d) && this.f(g.q, e.q) < b)) {
            g.d = e.d = !0;
            break
          }
    l = this.a;
    a = [];
    b = c = 0;
    for (k = l.length; c < k; b = ++c) d = l[b], f[b].d && a.push(d);
    return a
  };
  c.A = function(b) {
    return {
      h: function(d) {
        return function() {
          return b._omsData.i.setOptions({
            strokeColor: d.legColors.highlighted[d.map.mapTypeId],
            zIndex: d.highlightedLegZIndex
          })
        }
      }(this),
      k: function(d) {
        return function() {
          return b._omsData.i.setOptions({
            strokeColor: d.legColors.usual[d.map.mapTypeId],
            zIndex: d.usualLegZIndex
          })
        }
      }(this)
    }
  };
  c.H = function(b, d) {
    var a, c, e, f, p, h, k, n, l, m;
    if (this.minZoomLevel && this.map.getZoom() < this.minZoomLevel) return !1;
    this.s = !0;
    m = b.length;
    a = this.D(function() {
      var a, d, c;
      c = [];
      a = 0;
      for (d = b.length; a < d; a++) n = b[a], c.push(n.p);
      return c
    }());
    f = m >= this.circleSpiralSwitchover ? this.v(m, a).reverse() : this.u(m, a);
    a = function() {
      var a, d, m;
      m = [];
      a = 0;
      for (d = f.length; a < d; a++) e = f[a], c = this.F(e), l = this.C(b, function(a) {
        return function(b) {
          return a.f(b.p, e)
        }
      }(this)), k = l.B, h = new t.Polyline({
        map: this.map,
        path: [k.position, c],
        strokeColor: this.legColors.usual[this.map.mapTypeId],
        strokeWeight: this.legWeight,
        zIndex: this.usualLegZIndex
      }), k._omsData = {
        l: k.position,
        i: h
      }, this.legColors.highlighted[this.map.mapTypeId] !== this.legColors.usual[this.map.mapTypeId] && (p = this.A(k), k._omsData.w = {
        h: q.addListener(k, "mouseover", p.h),
        k: q.addListener(k, "mouseout", p.k)
      }), k.setPosition(c), k.setZIndex(Math.round(this.spiderfiedZIndex + e.y)), m.push(k);
      return m
    }.call(this);
    delete this.s;
    this.r = !0;
    return this.trigger("spiderfy", a, d)
  };
  c.unspiderfy = function(b) {
    var d, a, c, e, f, p, h;
    null == b && (b = null);
    if (null ==
      this.r) return this;
    this.t = !0;
    e = [];
    c = [];
    h = this.a;
    f = 0;
    for (p = h.length; f < p; f++) a = h[f], null != a._omsData ? (a._omsData.i.setMap(null), a !== b && a.setPosition(a._omsData.l), a.setZIndex(null), d = a._omsData.w, null != d && (q.removeListener(d.h), q.removeListener(d.k)), delete a._omsData, e.push(a)) : c.push(a);
    delete this.t;
    delete this.r;
    this.trigger("unspiderfy", e, c);
    return this
  };
  c.f = function(b, d) {
    var a, c;
    a = b.x - d.x;
    c = b.y - d.y;
    return a * a + c * c
  };
  c.D = function(b) {
    var d, a, c, e, f;
    e = a = c = 0;
    for (f = b.length; e < f; e++) d = b[e], a += d.x, c += d.y;
    b = b.length;
    return new t.Point(a / b, c / b)
  };
  c.c = function(b) {
    return this.e.getProjection().fromLatLngToDivPixel(b)
  };
  c.F = function(b) {
    return this.e.getProjection().fromDivPixelToLatLng(b)
  };
  c.C = function(b, d) {
    var a, c, e, f, p, h;
    e = p = 0;
    for (h = b.length; p < h; e = ++p)
      if (f = b[e], f = d(f), "undefined" === typeof a || null === a || f < c) c = f, a = e;
    return b.splice(a, 1)[0]
  };
  c.m = function(b, c) {
    var a, g, e, f;
    if (null != b.indexOf) return b.indexOf(c);
    a = e = 0;
    for (f = b.length; e < f; a = ++e)
      if (g = b[a], g === c) return a;
    return -1
  };
  v.g = function(b) {
    return this.setMap(b)
  };
  v.g.prototype = new t.OverlayView;
  v.g.prototype.draw = function() {};
  return v
}();

module.exports = OverlappingMarkerSpiderfier;
