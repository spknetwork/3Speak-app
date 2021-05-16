module.exports = {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "id": "http://json-schema.org/draft-06/schema#",
    "type": "object",
    "properties": {
        "sourceMap": {
            "type": "array",
            "minItems": 1,
            "items": { "$ref": "#/definitions/sourceMap" }
        },
        "image": {
            "type": "array",
            "items": {
                "format": "uri"
            }
        },
        "location": {
            "description": "Geo tag of the post. Status: WIP. (Subject to change)",
            "$ref": "#/definitions/GeoCoordinates",
        },
        "author_name": {
            "description": "Author display name, might be different from username/author of post. For example this should be used when a different author created the post",
            "type": "string",
            "maxLength": 128
        },
        "category": {
            "description": "Category of the post. Can be plaintext, or a cryptographic reference. (Subject to change)",
            "type": "string",
            "maxLength": 128
        },
        "tags": {
            "type": "array",
            "minItems": 1,
            "items": { "type": "string" }
        },
        "hidden": {
            "description": "Disables display of post.",
            "type": "boolean",
        },
        "title": {
            "type": "string", "maxLength": 128
        },
        "description": {
            "$ref": "#/definitions/description"
        },
        "created": {
            "type": "string",
            "format": "date"
        },
        "last_update": {
            "type": "string",
            "format": "date"
        },
        "lang": {
            "description": "ISO 3166-1 alpha-2 language",
            "type": "string",
            "maxLength": 2
        },
        "attachments": {
            "description": "Work in progress",
            "type": "array",
            "items": { "type": "string" }
        },
        "mentions": {
            "description": "Work in progress",
            "type": "array",
            "items": { "type": "string" }
        },
        "refs": {
            "description": "Post refs, meant for identifying duplicate posts and/or linking to mirrored content across networks. The first item in the array should be the primary ref.",
            "type": "array",
            "minItems": 1,
            "items": { "type": "string" }
        },
        "ipfsLinks": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/ipfsLink"
            }
        },
        "preferredGateways": {
            "type": "array",
            "items": {"type": "string"}
        },
        "filesize": { "type": "number" },
        "video": {
            "type": "object",
            "properties": {
                "duration": { "type": "number" },
                "first_upload": { "type": "boolean" },
                "license": { "type": "string" },
                "extensions": {
                    "description": "Addition tags related to implementation specific metatags. (Subject to change) ",
                    "type": "array", 
                    "items": {"type": "string"}
                }
            }
        }
    },
    "definitions": {
        "positiveInteger": {
            "type": "integer",
            "minimum": 1
        },
        "sourceMap": {
            "type": "object",
            "description": "sourceMap, used for videos, images and more!",
            "required": ["type", "url"],
            "properties": {
                "id": {
                    "type": "string",
                    "maxLength": 12
                },
                "type": {
                    "$ref": "#/definitions/sourceMapType"
                },
                "url": {
                    "format": "uri"
                },
                "mimeType": {
                    "type": "string",
                    "maxLength": 50
                },
                "width": {
                    "$ref": "#/definitions/positiveInteger"
                },
                "height": {
                    "$ref": "#/definitions/positiveInteger"
                },
                "size": {
                    "$ref": "#/definitions/positiveInteger"
                }
            }
        },
        "sourceMapType": {
            "enum": ["video", "thumbnail", "body"]
        },
        "ipfsLink": {
            "type": "string",
            "pattern": "Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,}"
        },
        "description": {
            "type": "object",
            "description": "",
            "oneOf": [
                {
                    "required": [
                        "url"
                    ]
                },
                {
                    "required": [
                        "value"
                    ]
                }],
            "properties": {
                "url": { "$ref": "#/definitions/ipfsLink" },
                "value": {
                    "type": "string",
                    "maxLength": 8000
                },
                "format": {
                    "enum": ["markdown", "html", "text"]
                }
            }
        },
        "GeoCoordinates": {
            "type": "object",
            "required": ["latitude", "longitude"],
            "properties": {
                "latitude": {
                    "type": "number",
                    "minimum": -90,
                    "maximum": 90
                },
                "longitude": {
                    "type": "number",
                    "minimum": -180,
                    "maximum": 180
                }
            }
        }
    },
    "dependencies": {
        "exclusiveMinimum": "minimum",
        "exclusiveMaximum": "maximum",
    },
    "default": {}
}