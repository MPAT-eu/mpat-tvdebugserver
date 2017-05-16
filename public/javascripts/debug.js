function get(url, onload) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = onload;
    xhr.send();
}
function constantmsg(message) {
    return function () {
        var t = document.getElementById("textarea");
        t.textContent = message + "\n" + t.textContent;
    }
}
function receivedmsg() {
    return function () {
        var t = document.getElementById("textarea");
        t.textContent = this.responseText + "\n" + t.textContent;
        if (countLines(t.textContent, 0) > 1000) t.textContent = shorten(t.textContent, 0, 0);
    }
}
function countLines(s, i) {
	let index = s.indexOf('\n', i);
	if (index >= 0) return 1+countLines(s, index+1);
	return 0;
}
function shorten(s, start, num) {
	if (num >= 1000) return s.substring(0, start);
	let index = s.indexOf('\n', start);
	if (index >= 0) {
		return shorten(s, index+1, num + 1);
	}
	return s;
}
function getalllogs() {
    get("getalllogs", receivedmsg());
}
function dumpdata() {
    get("dumpData", receivedmsg());
}
function cleanup() {
    get("cleanup", receivedmsg());
}
function reset() {
    get("reset", receivedmsg());
}
function getlogs() {
    get("getlogs?ip=" + document.getElementById("input").value, receivedmsg());
}
function clearlogs() {
    get("clearlogs", receivedmsg());
}
function log() {
    get("log?message=" + document.getElementById("input").value, constantmsg("message sent"));
}
let goOn = true;
function stop() {
    goOn = false;
}
function continuousgetlogs() {
    if (!goOn) {
         goOn = true;
         return;
    }
	get("getlogs?ip=" + document.getElementById("input").value, receivedmsg());
    setTimeout(continuousgetlogs, 1000);
}
