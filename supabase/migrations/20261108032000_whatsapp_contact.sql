update public.portfolio_content
set content = jsonb_set(
  content,
  '{contact}',
  COALESCE(content->'contact', '{}'::jsonb) || jsonb_build_object('whatsapp', '+91 7838797588'),
  true
)
where id = 'published'
  and NULLIF(BTRIM(content #>> '{contact,whatsapp}'), '') IS NULL;
