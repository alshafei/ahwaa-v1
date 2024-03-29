class PrivateMessagesPaginationRenderer < WillPaginate::ViewHelpers::LinkRenderer

  def to_html
    links = @options[:page_links] ? windowed_links : []
    links = links.join(@options[:separator]).html_safe

    html = begin
      @template.link_to('', @template.user_path(:anchor => {:page => @collection.previous_page}), :class => 'arrow left').html_safe +
      @template.content_tag(:ul, links, :class => 'pag-numbers').html_safe +
      @template.link_to('', @template.user_path(:anchor => {:page => @collection.next_page}), :class => 'arrow right').html_safe
    end

    @options[:container] ? @template.content_tag(:div, html, container_attributes) : html
  end

  protected

  def windowed_links
    windowed_page_numbers.map { |n| page_link_or_span(n, (n == current_page ? 'active' : nil)) }
  end

  def page_link_or_span(page, span_class, text = nil)
    text ||= page.to_s
    if page && page != current_page
      page_link(page, text, :class => span_class)
    else
      page_span(page, text, :class => span_class)
    end
  end

  def page_link(page, text, attributes = {})
    @template.content_tag(:li, @template.link_to(text, @template.user_path(:anchor => {:page => page})), attributes)
  end

  def page_span(page, text, attributes = {})
    @template.content_tag(:li, @template.link_to(text, @template.user_path(:anchor => {:page => page})), attributes)
  end

end
