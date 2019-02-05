var ServerEndpoint = 'http://localhost:56669';
var ServerService = 'SearcherService.asmx';
var ServerMethod = 'Test';
var ServerRequestStep = 0;

var ContentKey = '%CONTENT_BLOCK%';
var ContentClassDefinition = 'content-block';
var ContentTemplate = '<div class="' + ContentClassDefinition + '">' + ContentKey + '</div>';

var ContainerElement = {};

var SmoothScrollTime = 2000;

$(document).ready(function () {
    $("a").on('click', function (event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, SmoothScrollTime, function () {
                window.location.hash = hash;
            });
        }
    });

    ContainerElement = document.getElementById('container');

    var isRequireMoreContent = true;
    while (isRequireMoreContent) {
        GetContentFromService(ServerRequestStep++);

        var lastContentElement = GetLastContentElement(ContentClassDefinition);
        isRequireMoreContent = IsElementInViewPort(lastContentElement);
    }
});

window.addEventListener('scroll', function (e) {
    var lastContentElement = GetLastContentElement(ContentClassDefinition);
    isAnchorInViewArea = IsElementInViewPort(lastContentElement);

    if (isAnchorInViewArea) {
        GetContentFromService(ServerRequestStep++);
    }
});

function GetLastContentElement(defineClass) {
    var contentElementsArray = document.getElementsByClassName(defineClass);
    var lastContentElement = contentElementsArray[contentElementsArray.length - 1];

    return lastContentElement;
}

function GetContentFromService(serverRequestStep) {
    var serverMethodPath = ServerEndpoint + '/' + ServerService + '/' + ServerMethod;
    requestParameter = JSON.stringify({ step: serverRequestStep });

    $.ajax(
        {
            type: "POST",
            async: false,
            url: serverMethodPath,
            data: requestParameter,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                AddNewContent(data);
            },
            error: function (data) {
                console.log("!Error!", data);
            }
        });
}

function AddNewContent(responseFromService) {
    var JSONobject = responseFromService.d;
    var deserializedJSON = JSON.parse(JSONobject);
    var contentElementItems = '';
    var contentElement = ContentTemplate;

    for (let i = 0; i < deserializedJSON.length; i++) {
        contentElementItems += deserializedJSON[i] += ' ';
    }

    contentElement = ReplaceStringByKey(contentElement, ContentKey, contentElementItems);
    ContainerElement.innerHTML += contentElement;

    if (deserializedJSON.length !== 0) {
        ContainerElement.innerHTML += '<hr>';
    }
}

function ReplaceStringByKey(stringSrc, key, replaceContent) {
    var stringDest = stringSrc.replace(key, replaceContent);

    return stringDest;
}

function IsElementInViewPort(element) {
    var top = element.offsetTop;
    var left = element.offsetLeft;
    var width = element.offsetWidth;
    var height = element.offsetHeight;

    while (element.offsetParent) {
        element = element.offsetParent;
        top += element.offsetTop;
        left += element.offsetLeft;
    }

    var result = (top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset);

    return result;
}