$(function(){
    $('.panel-sub-nav .sub-nav > li').last().addClass("last-child");
    $('.panel-sub-nav .sub-nav > li.active').prev().css("border-bottom", "0 none");
    $('.panel-sub-nav .sub-nav > li.active').next().css("border-top", "0 none");
    
    $('.js-stream-send-msg').bind('click', function() {
        $(this).siblings('.private-msg.send-from-stream').fadeIn(200);
        return false;
    })
});