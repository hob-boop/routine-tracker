// Run with: cscript "Documents\Claude Work\tests.js"
var passed = 0, failed = 0;

function assert(condition, name) {
  if (condition) {
    WScript.Echo('  PASS ' + name);
    passed++;
  } else {
    WScript.Echo('  FAIL ' + name);
    failed++;
  }
}

// Pure utility functions re-implemented in ES5 (matching index.html logic exactly)
function toMins(t) {
  var parts = t.split(' ');
  var timeParts = parts[0].split(':');
  var h = parseInt(timeParts[0], 10), m = parseInt(timeParts[1], 10), ap = parts[1];
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

function fmt(h, m) {
  var ap = h < 12 ? 'AM' : 'PM';
  var hh = h % 12 || 12;
  return hh + ':' + (m === 0 ? '00' : '30') + ' ' + ap;
}

function dk(d) {
  var mo = String(d.getMonth() + 1);
  var day = String(d.getDate());
  if (mo.length < 2) mo = '0' + mo;
  if (day.length < 2) day = '0' + day;
  return d.getFullYear() + '-' + mo + '-' + day;
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

if (!String.prototype.trim) {
  String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); };
}

function validateFeedbackText(text) {
  return typeof text === 'string' && text.trim().length > 0;
}

// ── toMins ──
WScript.Echo('toMins');
assert(toMins('12:00 AM') === 0,    '12:00 AM = 0 mins');
assert(toMins('12:30 AM') === 30,   '12:30 AM = 30 mins');
assert(toMins('1:00 AM') === 60,    '1:00 AM = 60 mins');
assert(toMins('12:00 PM') === 720,  '12:00 PM = 720 mins');
assert(toMins('1:00 PM') === 780,   '1:00 PM = 780 mins');
assert(toMins('11:30 PM') === 1410, '11:30 PM = 1410 mins');

// ── fmt ──
WScript.Echo('fmt');
assert(fmt(0, 0) === '12:00 AM',  'midnight → 12:00 AM');
assert(fmt(12, 0) === '12:00 PM', 'noon → 12:00 PM');
assert(fmt(13, 30) === '1:30 PM', '13:30 → 1:30 PM');
assert(fmt(23, 0) === '11:00 PM', '23:00 → 11:00 PM');
assert(fmt(0, 30) === '12:30 AM', '0:30 → 12:30 AM');

// ── dk ──
WScript.Echo('dk');
assert(dk(new Date(2026, 5, 16)) === '2026-06-16', 'formats date correctly');
assert(dk(new Date(2026, 0, 1)) === '2026-01-01',  'pads single-digit month and day');
assert(dk(new Date(2026, 11, 31)) === '2026-12-31', 'Dec 31 with two-digit month');

// ── esc ──
WScript.Echo('esc');
assert(esc('<script>') === '&lt;script&gt;',              'escapes angle brackets');
assert(esc('"quoted"') === '&quot;quoted&quot;',          'escapes double quotes');
assert(esc('a & b') === 'a &amp; b',                     'escapes ampersand');
assert(esc('safe text') === 'safe text',                  'leaves safe text unchanged');
assert(esc('<b onclick="x">') === '&lt;b onclick=&quot;x&quot;&gt;', 'escapes XSS attempt');

// ── validateFeedbackText ──
WScript.Echo('validateFeedbackText');
assert(validateFeedbackText('hello') === true,          'accepts non-empty text');
assert(validateFeedbackText('  hello  ') === true,      'accepts text with surrounding spaces');
assert(validateFeedbackText('  ') === false,            'rejects whitespace-only string');
assert(validateFeedbackText('') === false,              'rejects empty string');
assert(validateFeedbackText(null) === false,            'rejects null');

WScript.Echo('');
WScript.Echo(passed + ' passed, ' + failed + ' failed');
if (failed > 0) WScript.Quit(1);
