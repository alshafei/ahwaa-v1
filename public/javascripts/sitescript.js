$(function(){
    function toggleSignUp(link, formName){
        $('.auth-wrapper > a').add('.over-form').removeClass('auth-form-active');
        link.addClass('auth-form-active');
        if(!formName){
          formName = '.' + link.attr('id') + '-form';
        }
        $(formName).addClass('auth-form-active').offset({
            'left': link.offset().left,
            'top': link.offset().top + link.outerHeight() - 1
            }
        );
    }

    $('.auth-wrapper > a').click(function(){
        toggleSignUp($(this));
        return false;
    });

    $('#forgot-pass').click(function(){
        $('#forgot-pass').addClass('auth-form-active');
        toggleSignUp($('#login'), '.' + $(this).attr('id') + '-form');
        return false;
    });

    $('.sign-up-btn').live('click', function(){
        var btn = $(this);
        btn.addClass('auth-form-active').closest('.request-error').removeClass('auth-form-active');
        toggleSignUp($('#sign-up'));
        return false;
    });

    $('.request-topic').click(function(e){
       var _btn = $(this);
       if(_btn.hasClass('disabled')){
           _btn.addClass('auth-form-active');
           $('.auth-form-active').removeClass('auth-form-active');
           var offset = _btn.offset();
           $('.request-error').addClass('auth-form-active');
           e.preventDefault();
           return false;
       }
    });

    $(document).unbind('click').click(function(e){
        !$(e.target).hasClass('auth-form-active') && !$(e.target).closest('.auth-form-active').length && $('.auth-form-active').removeClass('auth-form-active');
        if(e.target.tagName != "a"){ $('.search_results').removeClass('visible'); }
    });

    $('.cancel-forgot').click(function(){
        $('.auth-form-active').removeClass('auth-form-active');
        toggleSignUp($('#login'));
        return false;
    });

    $('.sign-up-form').submit(function(){
        var that = $(this);
        that.find('.error').remove();

        $.ajax({
            url: this.action,
            dataType: 'json',
            type: 'post',
            data: $(this).serialize(),
            success: function (data) {
                location.reload();
            },
            error: function (data) {
                data = eval('(' + data.responseText + ')');
                for (var attr in data) {
                    var wrapper = that.find('.' + attr);
                    if(wrapper.length === 0) {
                        wrapper = that.find('.errors');
                    }
                    wrapper.append('<p class="error">' + attr + ' ' + data[attr] + '</p>');
                }
            }
        });

        return false;
    }).find('input[type=submit]').formValidator(
        {
            'errors': {
                'email': I18n.t('layouts.application.header.sign_up_form.error_email_empty'),
                'text': I18n.t('layouts.application.header.sign_up_form.error_username_empty')
            }
        }
    );

    $('.sign-up-form #user_email').change(function () {
        $('.sign-up-form #user_username').val($(this).val().replace(/@.*$/, ''));
    });

    $('.login-form').find('input[type=submit]').formValidator(
        {
            'errors': {
                'text': I18n.t('layouts.application.header.login_form.error_login_empty'),
                'password': I18n.t('layouts.application.header.sign_up_form.error_password_empty')
            }
        }
    );

    $('.forgot-pass-form').submit(function () {
        var that = $(this),
            inputSubmit = that.find('input[type=submit]').attr('disabled', 'disabled');
        that.find('.error').remove();
        $.ajax({
            url: this.action,
            dataType: 'json',
            type: 'post',
            data: $(this).serialize(),
            success: function (data) {
                var success = $('<p>').addClass('success').text(I18n.t('layouts.application.header.forgot_pass_form.sent')).appendTo(that.find('.login')),
                    inputTxt = that.find('.login input').hide();
                setTimeout(function(){
                    $('a.auth-form-active').removeClass('auth-form-active');
                    that.fadeOut(function(){
                        that.css('display', '').removeClass('auth-form-active');
                        success.remove();
                        inputTxt.val('').show();
                        inputSubmit.removeAttr('disabled');
                    });
                }, 2000);
            },
            error: function (data) {
                if(data.status == 404) {
                    that.find('.login').append('<p class="error">' + I18n.t('layouts.application.header.forgot_pass_form.not_found') + '</p>');
                }
                inputSubmit.removeAttr('disabled');
            }
        });
        return false;
    }).find('input[type=submit]').formValidator(
        {
            'errors': {
                'text': I18n.t('layouts.application.header.forgot_pass_form.empty')
            }
        }
    );

    $('.over-form').find('input').keyup(function(){
        var input = $(this);
        $.trim(input.val()) && input.next('.auth-form-error').remove();
    });

    $('.search').find('input').keyup(function(){
        var input = $(this);
        $.trim(input.val()) ? input.next().addClass('clear') : input.next().removeClass('clear') && $('.search_results').removeClass('visible');
    }).next().click(function(){
        var _magnify = $(this);
        _magnify.hasClass('clear') && _magnify.removeClass('clear') && _magnify.prev().val(' ').focus();
        $('.search_results').removeClass('visible');
    });

    $(".request-topic.active").pageSlide({ width: "556px", direction: "left", modal: true }).click(function(){
        $('.pageslide-body-wrap').addClass('jlo');
    });

    $('.send-private-msg').click(function(){
        if(!$(this).hasClass('disabled')) {
            $(this).addClass('disabled').closest('.private-msg').children('form').slideDown();
        }
       return false;
    });

    $('.private-msg').find('.cancel').click(function(){
       $(this).closest('.private-msg').find('form').slideUp().end().find('.send-private-msg').removeClass('disabled');
    });

    $('.avatar').live('mouseover',function(){
        $(this).siblings('.private-msg').removeClass('inside');
            if($("body").width() < 1372 && $(this).parent().parent().is('div:first-child') || $("body").width() < 1372 && $(this).parents().hasClass('topics')) {
                $(this).siblings('.private-msg').fadeIn('fast').addClass('inside').addClass('active-avatar');
            }
            else{
                $(this).siblings('.private-msg').fadeIn('fast').addClass('active-avatar');
            }
    });

    $('.active-avatar').live('mouseleave', function(){
       var pm = $(this) ;
       pm.fadeOut('fast', function(){
         pm.find('.pm-flash').remove();
       });
    });

    //function to place the extra topic tags into the "more" vertical list
    var lisTotal = $('#header-tags').children().length;
    var lisIndex = lisTotal;
    var lisWidth = 0;

    /*$('#header-tags > li').each(function(e){
        lisWidth = lisWidth + $('#header-tags > li').eq(-lisIndex).width();
        lisIndex = lisIndex-1;
        console.log(lisWidth);
    })*/


    for (var count = 0; count < lisTotal; count++){
        lisWidth = lisWidth + $('#header-tags > li').eq(-lisIndex).width();
        lisIndex = lisIndex-1;
        //console.log(lisWidth);
    }

    $('.items > div:last-child').css("background","none");

    if (!$.browser.webkit) {
        var inputs = $('input:text');

        inputs.each(function(){
            if($(this).attr('placeholder') && $(this).attr('placeholder').length > 0){
                $(this).addClass('placeholder');
                $.data(inputs, 'tovalue', $(this).attr('placeholder'));
                $(this).attr('value', $.data(inputs, 'tovalue'));
                inputs.focus(function(e){
                    if ($(this).attr('value') == $(this).attr('placeholder')){
                        $(this).removeClass('placeholder').attr('value', ' ');
                    }
                });
                inputs.blur(function(){
                    if($(this).attr('value').length <= 1){
                        $(this).addClass('placeholder').attr('value', $(this).attr('placeholder'));
                    }
                });
            }
        });
     }
});
