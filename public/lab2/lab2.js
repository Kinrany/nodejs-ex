const questionsJsonUrl = "questions.json";
const statisticsJsonUrl = "getResults";
const dataDeferred = $.getJSON(questionsJsonUrl);

// global namespace for jQuery objects
const $g = {
    load: function () {
        $g.inputQuestionTemplate = $("#input-question-template");
        $g.inputForm = $("#input-form");
        $g.inputQuestions = $("#input-questions");
        $g.inputDownloadingLabel = $g.inputForm.find('.hide-on-form-load');
        $g.inputNameField = $("#input-name");
        $g.successLabel = $("#success-label");
        $g.failureLabel = $("#failure-label");
        $g.statsWaitingLabel = $("#stats-waiting-label");
        $g.statsLoadingLabel = $("#stats-loading-label");
        $g.statsResult = $("#stats-result");
        $g.statsQuestionTemplate = $("#statistics-question-template");
        $g.statsQuestions = $("#stats-questions");
        $g.statsCount = $("#stats-count");
        $g.statsFirstDate = $("#stats-first-date");
        $g.statsLastDate = $("#stats-last-date");
    }
};

$(document).ready(function () {
    $g.load();

    dataDeferred.done(loadQuestions).done(function () {
        $g.inputForm.find("button").click(submitForm);
    });
});

function submitForm() {
    let jsonData = { name: $g.inputNameField.val(), answers: [] };
    $g.inputForm.find('select').map((i, e) => {
        jsonData.answers[i] = $(e).val();
    });

    $.post("submitForm", jsonData, function success() {
        console.log("Success.");
        $g.successLabel.toggleClass('hide', false);
        $g.failureLabel.toggleClass('hide', true);

        console.log("Loading statistics");
        $g.statsWaitingLabel.toggleClass('hide', true);
        $g.statsLoadingLabel.toggleClass('hide', false);
        $.getJSON(statisticsJsonUrl)
            .done(loadStatistics)
            .catch(function(message) {
                console.log("Failed to load statistics");
                console.log(message);
            });
    })
        .fail(function () {
            console.log("Error.");
            $g.successLabel.toggleClass('hide', true);
            $g.failureLabel.toggleClass('hide', false);
        });
    console.log("Form posted: " + JSON.stringify(jsonData));
}

function loadStatistics(data) {
    let { count, firstDate, lastDate, answers } = data;
    $g.statsCount.text(count);

    $g.statsFirstDate.text(moment(firstDate));
    $g.statsLastDate.text(moment(lastDate));

    let questionTemplate = $g.statsQuestionTemplate.html();
    for (let answer_id in answers) {
        let question = $(questionTemplate);
        question.appendTo($g.statsQuestions);
        question.text(JSON.stringify(answers[answer_id]));
    }

    console.log("Finished loading statistics");
    $g.statsLoadingLabel.toggleClass('hide', true);
    $g.statsResult.toggleClass('hide', false);
}

function loadQuestions(data) {
    const { questions } = data;

    for (let qi = 0; qi < questions.length; ++qi) {
        let { question, answers } = questions[qi];
        appendQuestion($g.inputQuestions, question, answers);
    }

    // http://materializecss.com/forms.html#select-initialization
    $('select').material_select();

    $g.inputDownloadingLabel.addClass('hide');
}

function appendQuestion(parent, question, answers) {
    parent.append($g.inputQuestionTemplate.html());
    let questionItem = parent.children(".input-question-item:last-child");

    questionItem.find(".input-question-label").text(question);

    let questionSelect = questionItem.find(".input-question-select");

    appendOptionDefault(questionSelect, "Выберите вариант");

    for (let ai = 0; ai < answers.length; ++ai) {
        appendOption(questionSelect, answers[ai], ai);
    }
}

function appendOption(parent, answer, value) {
    let option = $("<option>");
    option.text(answer);
    option.val(value);
    option.appendTo(parent);
    return option;
}

function appendOptionDefault(parent, answer, value) {
    let option = appendOption(parent, answer, value);
    option.addClass('disabled selected');
}
