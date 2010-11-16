$(function(){
    $('.topic-content > p').comments({color: '#FFFF00'});
    $('.related-content > div > ul').blockSlider();

    /* The Browser Sniff is pending*/
    $('.add_comments > div > textarea').click(function(){
        $(this).css('color', '#6c6f74');
    });                                

    $('.add_comments > div > textarea').live('keypress', function(e){
        var textarea = $(this);
        e.keyCode == '13' && textarea.height(textarea.height() + 13);
    });

    var posX = Math.ceil(($(window).width() - 960)/2) - 30;
    $('.social-bookmarkers').css({'left' : posX + 'px', 'display' : 'block'}); 

    posX = Math.ceil(($(window).width() - 960)/2);
    $('aside').css({'right' : posX + 'px', 'display' : 'block'}); 
    
    $(window).resize(function() {
        posX = Math.ceil(($(window).width() - 960)/2) - 30;
        $('.social-bookmarkers').css({'left' : posX + 'px', 'display' : 'block'});
    
        posX = Math.ceil(($(window).width() - 960)/2);        
        $('aside').css({'right' : posX + 'px', 'display' : 'block'}); 
    });

    $('.form-private-msg').submit(function(){
        var _form = $(this);
        //Aqui va el ajax
        //If Success
        _form.prepend('<div class="success-validation border-all"><p>' + I18n.t('private_message.message_sent') + '</p></div>');
        _form.delay(2000).slideUp(function(){
            _form.parent().find('.send-private-msg').removeClass('disabled').end().find('.success-validation').remove();
        });
        return false;
    });
    
    $('.continue').live('click', function(){
       $(this).closest('.sign-up-or-continue').slideUp(function(){
           var signUp = $(this);
           signUp.next().slideDown();
           signUp.remove();
       });
    });  
    
    $('.res-flag-btns').find('a').live('click', function(e){
        var lk = $(this),
            sign_up = lk.parent().find('.sign-up-tt-wrapper');
        sign_up.css('left', (Math.abs(Math.floor(lk.outerWidth()/2 - sign_up.outerWidth()/2))*-1+lk.position().left)).animate({top : '-110', opacity : 'show'}, 'slow')
        e.preventDefault();
        return false;
    });
    
    $('.flag:not(.disabled)').live('click', function () {
        var that = $(this);
        var reply = new Reply({
            id: that.attr('data-value'),
            topic_id: topicId
        });
        reply.flag({
            success: function (r) {
                that.addClass('disabled').find('span').text(I18n.t('replies.reply.flagged'));
            },
            error: function () {
                that.addClass('disabled').find('span').text(I18n.t('replies.reply.already_flagged'));
            }
        });
        return false;
    });

    $('.useful:not(.disabled)').live('click', function () {
        var that = $(this);
        var reply = new Reply({
            id: that.attr('data-value'),
            topic_id: topicId
        });
        reply.vote_up({
            success: function (r) {
                that.text(I18n.t('replies.reply.useful')).addClass('disabled');
            },
            error: function () {
                that.text(I18n.t('replies.reply.already_useful')).addClass('disabled');
            }
        });
        return false;
    });
});