$(function(){
    var spinner = new Spinner({
        lines: 20,
        length: 30, 
        radius: 40
    });
    function loadVideo() {
        $("#videoDiv").attr("src", "https://thakeraj1.blob.core.windows.net/videos/" + $("#videoSelect").val() + ".mp4");
        $("#videoDiv")[0].autoplay = true;
    }
    function loadStatistics(data) {

    
        function loadAudioStats() {

            function loadAudioStatsChart(expressionsStats) {
                if($('#toneAnalysis').highcharts()) {
                    $('#toneAnalysis').highcharts().destroy("true");
                }
                Highcharts.chart('toneAnalysis', {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: 'Tone Analysis'
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    series: [{
                        name: 'Vocal Impact',
                        colorByPoint: true,
                        data: expressionsStats
                    }]
                });
           }

            var audioStatistics = JSON.parse(data);
            var summarizedInsights = audioStatistics.summarizedInsights;
            var sentiments = summarizedInsights.sentiments;
            var expressionsStats = [];
            $.each(sentiments, function(i, element){
                var sentiment = [
                element.sentimentKey,element.seenDurationRatio
                ];
                expressionsStats.push(sentiment);
            });
            loadAudioStatsChart(expressionsStats); 

       }
       function loadRecommendations() {
        var options = document.getElementsByName('speechType');
            for(var i=0;i<options.length;i++){
                if(options[i].checked) { val = keywords()[options[i].value]; }
            }
            var xhr = new XMLHttpRequest();
            var url = 'https://www.googleapis.com/youtube/v3/search?q='+val.split(' ').join('+')+'&maxResults=10&part=snippet&type=video&key=AIzaSyDjgPK_wZClwhgznl7Za343PBjYykQ8KAU';
            xhr.open('GET', url, true);
            xhr.send();
            xhr.onreadystatechange = processRequest;
            var display = '';
            function processRequest(e) {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var response = JSON.parse(xhr.responseText);
                    var items = response["items"];
                    var rec = document.getElementById('recommendation');
                    rec.innerHTML = '';
                    var br = document.createElement('br');
                    rec.appendChild(br);
                    var ul = document.createElement('ul');
                    for(var i = 0; i<5;i++){
                        var li = document.createElement('li');
                        var video_id = items[i]['id']['videoId'];
                        var a = document.createElement('a');
                        a.setAttribute('style', 'text-decoration: none');
                        a.setAttribute('style', 'color: black');
                        a.setAttribute('style', 'text-decoration: none');
                        a.href = 'https://www.youtube.com/watch?v='+video_id;
                        a.innerHTML = items[i]['snippet']['title'];
                        a.setAttribute('target', '_blank');
                        var br = document.createElement('br');
                        a.appendChild(br);
                        li.appendChild(a);
                        ul.appendChild(li);
                    }
                    rec.appendChild(ul);                  
                }
            }
        }

        function keywords(){
            var rec_keywords = {'Interview':'How to prepare for Interview', 'Funeral Speech':'Saying goodbye in style',
            'Informative Speech': 'Giving a well-organized and Informative speech',
            'Farewell': 'Saying goodbye in style'}
            return rec_keywords;
        }

        $("#result").show();    
        loadAudioStats();
        loadRecommendations();
    }
    
    $(".opt").off('click');
    $(".opt").on('click', function(e){
        $.each($(".opt"), function(idx, ele) {
            $(ele).parent().removeClass("active");
            $(ele).prop("checked", false);
        });
        $(this).prop("checked", true);
        $(this).parent().addClass("active")
    });

    function loadChart(emotions) {
        if($('#expressionAnalysis').highcharts()) {
            $('#expressionAnalysis').highcharts().destroy("true");
        }
        Highcharts.chart('expressionAnalysis', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Expressions Analysis'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Emotions',
                colorByPoint: true,
                data: [{
                    name: 'Anger',
                    y: emotions[0]
                }, {
                    name: 'Contempt',
                    y: emotions[1]
                }, {
                    name: 'Disgust',
                    y: emotions[2]
                }, {
                    name: 'Fear',
                    y: emotions[3]
                }, {
                    name: 'Happiness',
                    y: emotions[4]
                }, {
                    name: 'Neutral',
                    y: emotions[5]
                }, {
                    name: 'Sadness',
                    y: emotions[6]
                }, {
                    name: 'Surprise',
                    y: emotions[7]
                }]
            }]
        });
    }
    
    function loadSmile(smile) {
        $("#smile_value").text(Math.round(smile/0.15) + "%");
    }

    
    function loadPhotoAnalysis() {
        var subscriptionKey = "84ce3107ffd84830975e1f2b5efaca09";
        var uriBase = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect";
        var params = {
            "returnFaceId": "true",
            "returnFaceLandmarks": "false",
            "returnFaceAttributes": "age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
        };
        var counter =0;
        var videoStats = [0,0,0,0,0,0,0,0];
        var requests = [];
        var smile = 0;
        for(var idx=1;idx<=15;idx++) {
            var data_id = $("#videoSelect").find(":selected").data().id;
            var url = "{'url': 'https://thakeraj1.blob.core.windows.net/photos/img" + data_id + (++counter) + ".jpeg'}";
            requests.push($.ajax({
                    url: uriBase + "?" + $.param(params),
                    beforeSend: function(xhrObj){
                        xhrObj.setRequestHeader("Content-Type","application/json");
                        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
                    },
                    type: "POST",
                    data: url,
                    success: function(data) {
                        if(data[0]) {
                            var resultOfFrame = data[0];
                            if(resultOfFrame && resultOfFrame.faceAttributes) {
                                var faceAttributes = resultOfFrame.faceAttributes;
                                var faceAttributesEmotions = faceAttributes.emotion;
                                videoStats[0] += faceAttributesEmotions.anger;
                                videoStats[1] += faceAttributesEmotions.contempt;
                                videoStats[2] += faceAttributesEmotions.disgust;
                                videoStats[3] += faceAttributesEmotions.fear;
                                videoStats[4] += faceAttributesEmotions.happiness;
                                videoStats[5] += faceAttributesEmotions.neutral;
                                videoStats[6] += faceAttributesEmotions.sadness;
                                videoStats[7] += faceAttributesEmotions.surprise;
                                smile += faceAttributes.smile;
                            }
                        }     
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                         var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
                        errorString += (jqXHR.responseText === "") ? "" : ($.parseJSON(jqXHR.responseText).message) ?
                        $.parseJSON(jqXHR.responseText).message : $.parseJSON(jqXHR.responseText).error.message;
                        console.log(errorString);
                    }
                })
            );
            $.when.apply(null, requests).then(function(){
                $(".modal-backdrop").remove();
                spinner.stop();
                loadChart(videoStats);
                loadVideo();
                loadSmile(smile);
            });  
        }
    }
    
    $("#uploadFeed").off('click');
    $("#uploadFeed").on('click', function(e){ 
        var url = "http://selfenhancer.azurewebsites.net/api/Frame?videoName=" + $("#videoSelect").val();

        //var url = "http://localhost:52245/api/Frame?videoName=" + $("#videoSelect").val();

        var url = "";
        if(!$("#loadFast").prop("checked")) {
            url = "http://selfenhancer.azurewebsites.net/api/Frame?videoName=" + $("#videoSelect").val();
        } else {
            url = "http://selfenhancer.azurewebsites.net/api/Frame?token=" + $("#videoSelect").find(":selected").data("fast") + "&data=''";
        }
        
        $('<div class="modal-backdrop"></div>').appendTo(document.body);
        spinner.spin();
        document.body.appendChild(spinner.el);
        $.ajax({
            url: url,
            type: "GET",
            processData: false,
            contentType: false,
            crossDomain: true,
            success: function(data) {
                loadStatistics(JSON.parse(data)); 
                loadPhotoAnalysis();
            },
            error: function(err) {
                alert(err);
            }
        });
    });
    
});