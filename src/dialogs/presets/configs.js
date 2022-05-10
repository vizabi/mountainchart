export const PRESETS = [
  [{
    icon: "show_countries--stack_none--facet_none",
    mode: "show",
    loosePath: ["geo", "geo", "$in"],
    config: {
      data: {
        filter: {dimensions: {"geo": {"geo": {$in: ["usa", "chn", "rus", "nga"]}}}}
      },
      encoding: {
        stack: {data: {constant:"none", space: null, concept: null}},
        facet_row: {data: {constant: "none", concept: null, exceptions: null}}
      }
    }
  },{
    icon: "show_countries--stack_region--facet_none",
    mode: "select",
    config: {
      data: {
        filter: {dimensions: { "geo": { "un_state": true } }}
      },
      encoding: {
        stack: {data: {constant:null, space: ["geo"], concept: "world_4region"}},
        facet_row: {data: {constant: "none", concept: null, exceptions: null}}
      }
    }
  },{
    icon: "show_regions--stack_none--facet_none",
    mode: "none",
    groupPath: ["geo"],
    config: {
      data: {
        filter: {dimensions: { "geo": { "is--world_4region": true } }}
        //filter: {dimensions: {"geo": {"geo": {$in: ["americas", "europe", "africa", "asia"]}}}}
      },
      encoding: {
        stack: {data: {constant:"none", space: null, concept: null}},
        facet_row: {data: {constant: "none", concept: null, exceptions: null}}
      }
    }
  }],


  [{
    icon: "show_countries--stack_all--facet_none",
    mode: "select",
    config: {
      data: {
        filter: {dimensions: { "geo": { "un_state": true } }}
      },
      encoding: {
        stack: {data: {constant:"all", space: null, concept: null}},
        facet_row: {data: {constant: "none", concept: null, exceptions: null}}
      }
    }
  },{
    icon: "show_regions--stack_all--facet_none",
    mode: "none",
    groupPath: ["geo"],
    config: {
      data: {
        filter: {dimensions: { "geo": { "is--world_4region": true } }}
        //filter: {dimensions: {"geo": {"geo": {$in: ["americas", "europe", "africa", "asia"]}}}}
      },
      encoding: {
        stack: {data: {constant:"all", space: null, concept: null}},
        facet_row: {data: {constant: "none", concept: null, exceptions: null}}
      }
    }
  },{
    icon: "show_world--stack_all--facet_none",
    mode: "none",
    config: {
      data: {
        filter: {dimensions: { "geo": { "is--global": true } }}
        //filter: {dimensions: {"geo": {"geo": {$in: ["world"]}}}}
      },
      encoding: {
        stack: {data: {constant:"all", space: null, concept: null}},
        facet_row: {data: {constant: "none", concept: null, exceptions: null}}
      }
    }
  }],


  [{
    icon: "show_geo--stack_all--facet_isness",
    mode: "show",
    groupPath: ["geo", "$or", 0],
    loosePath: ["geo", "$or", 1, "geo", "$in"],
    config: {
      data: {
        filter: {dimensions: { "geo": { "$or": [{"is--world_4region": true}, {"geo": {"$in": ["chn"]}}] } }}
        //filter: {dimensions: {"geo": {"geo": {$in: ["americas", "europe", "africa", "asia", "chn"]}}}}
      },
      encoding: {
        stack: {data: {constant:"all", space: null, concept: null}},
        facet_row: {data: {constant: null, concept: "is--", exceptions: {"is--country": "geo"}}}
      }
    }
  },{
    icon: "show_regions--stack_all--facet_regions",
    mode: "none",
    groupPath: ["geo"],
    config: {
      data: {
        filter: {dimensions: { "geo": { "is--world_4region": true } }}
        //filter: {dimensions: {"geo": {"geo": {$in: ["americas", "europe", "africa", "asia"]}}}}
      },
      encoding: {
        stack: {data: {constant:"all", space: null, concept: null}},
        facet_row: {data: {constant: null, concept: "world_4region", exceptions: null}}
      }
    }
  },{
    icon: "show_countries--stack_all--facet_regions",
    mode: "select",
    config: {
      data: {
        filter: {dimensions: { "geo": { "un_state": true } }}
      },
      encoding: {
        stack: {data: {constant:"all", space: null, concept: null}},
        facet_row: {data: {constant: null, concept: "world_4region", exceptions: null}}
      }
    }
  }],
];
