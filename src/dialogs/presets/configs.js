export const PRESETS = [
  [{
    icon: "show_countries--stack_none--facet_none",
    inherit: "filter",
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
    inherit: "selection",
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
    inherit: "none",
    config: {
      data: {
        filter: {dimensions: { "geo": { "is--world_4region": true } }}
      },
      encoding: {
        stack: {data: {constant:"none", space: null, concept: null}},
        facet_row: {data: {constant: "none", concept: null, exceptions: null}}
      }
    }
  }],


  [{
    icon: "show_countries--stack_all--facet_none",
    inherit: "selection",
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
    inherit: "none",
    config: {
      data: {
        filter: {dimensions: { "geo": { "is--world_4region": true } }}
      },
      encoding: {
        stack: {data: {constant:"all", space: null, concept: null}},
        facet_row: {data: {constant: "none", concept: null, exceptions: null}}
      }
    }
  },{
    icon: "show_world--stack_all--facet_none",
    inherit: "none",
    config: {
      data: {
        filter: {dimensions: { "geo": { "is--global": true } }}
      },
      encoding: {
        stack: {data: {constant:"all", space: null, concept: null}},
        facet_row: {data: {constant: "none", concept: null, exceptions: null}}
      }
    }
  }],


  [{
    icon: "show_geo--stack_all--facet_isness",
    inherit: "filter",
    config: {
      data: {
        filter: {dimensions: { "geo": { "$or": [{"is--world_4region": true}, {"geo": {"$in": ["chn"]}}] } }}
      },
      encoding: {
        stack: {data: {constant:"all", space: null, concept: null}},
        facet_row: {data: {constant: null, concept: "is--", exceptions: {"is--country": "geo"}}}
      }
    }
  },{
    icon: "show_regions--stack_all--facet_regions",
    inherit: "none",
    config: {
      data: {
        filter: {dimensions: { "geo": { "is--world_4region": true } }}
      },
      encoding: {
        stack: {data: {constant:"all", space: null, concept: null}},
        facet_row: {data: {constant: null, concept: "world_4region", exceptions: null}}
      }
    }
  },{
    icon: "show_countries--stack_all--facet_regions",
    inherit: "selection",
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
