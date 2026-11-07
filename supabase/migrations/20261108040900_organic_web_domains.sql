update public.portfolio_content
set content = content || jsonb_build_object(
  'web',
  $organic_web$
  {
    "enabled": true,
    "sectionTitle": "Welcome to my web",
    "sectionSubtitle": "Eight worlds. One mind. Explore what I create.",
    "defaultExpanded": false,
    "domains": [
      {"id":"tech","slug":"tech","title":"Tech","description":"Software, development, digital products, and technical experiments.","icon":"code","published":true,"displayOrder":1,"themePresetId":"tech","position":{"x":20,"y":22},"threadLength":65,"pagePath":"/domains/tech","featuredProjectIds":[],"socialLinkIds":[],"connections":[],"createdAt":null,"updatedAt":null},
      {"id":"art","slug":"art","title":"Art","description":"Visual art, illustrations, design, and creative experiments.","icon":"palette","published":true,"displayOrder":2,"themePresetId":"art","position":{"x":76,"y":20},"threadLength":72,"pagePath":"/domains/art","featuredProjectIds":[],"socialLinkIds":[],"connections":[],"createdAt":null,"updatedAt":null},
      {"id":"poet","slug":"poet","title":"Poet","description":"Poetry, reflections, words, and original writing.","icon":"feather","published":true,"displayOrder":3,"themePresetId":"poet","position":{"x":49,"y":43},"threadLength":58,"pagePath":"/domains/poet","featuredProjectIds":[],"socialLinkIds":[],"connections":[],"createdAt":null,"updatedAt":null},
      {"id":"music","slug":"music","title":"Music","description":"Music, sound, compositions, and audio experiments.","icon":"music","published":true,"displayOrder":4,"themePresetId":"music","position":{"x":15,"y":67},"threadLength":70,"pagePath":"/domains/music","featuredProjectIds":[],"socialLinkIds":[],"connections":[],"createdAt":null,"updatedAt":null},
      {"id":"vlog","slug":"vlog","title":"Vlog","description":"Personal videos, adventures, experiences, and everyday stories.","icon":"video","published":true,"displayOrder":5,"themePresetId":"vlog","position":{"x":83,"y":66},"threadLength":75,"pagePath":"/domains/vlog","featuredProjectIds":[],"socialLinkIds":[],"connections":[],"createdAt":null,"updatedAt":null},
      {"id":"edu","slug":"edu","title":"Edu","description":"Educational content, explanations, tutorials, and learning resources.","icon":"book-open","published":true,"displayOrder":6,"themePresetId":"edu","position":{"x":35,"y":81},"threadLength":62,"pagePath":"/domains/edu","featuredProjectIds":[],"socialLinkIds":[],"connections":[],"createdAt":null,"updatedAt":null},
      {"id":"sport","slug":"sport","title":"Sport","description":"Sports, fitness, training, activities, and personal progress.","icon":"trophy","published":true,"displayOrder":7,"themePresetId":"sport","position":{"x":67,"y":84},"threadLength":68,"pagePath":"/domains/sport","featuredProjectIds":[],"socialLinkIds":[],"connections":[],"createdAt":null,"updatedAt":null},
      {"id":"cyber","slug":"cyber","title":"Cyber","description":"Cybersecurity, ethical hacking, digital safety, and security research.","icon":"shield-check","published":true,"displayOrder":8,"themePresetId":"cyber","position":{"x":51,"y":59},"threadLength":64,"pagePath":"/domains/cyber","featuredProjectIds":[],"socialLinkIds":[],"connections":[],"createdAt":null,"updatedAt":null}
    ],
    "connections": [],
    "themePresets": []
  }
  $organic_web$::jsonb
)
where id = 'published'
  and content->'web' is null;
