extension Stylist {
    static func create() -> Stylist {

        let stylist = Stylist()

{{#if styles}}
{{#each styles}}
        stylist.addStyle(identifier: "{{name}}") { 
            AnyView($0{{#each style}}
                      .{{name}}({{{value}}}){{/each}}
                      {{#if text}}
                      .styleText { text in
                          text{{#each text}}
                              .{{name}}({{{value}}}){{/each}}
                      }{{/if}}
            ) 
        }
{{/each}}
{{/if}}

        // General style for any titles in the clients section
        stylist.addStyle(identifier: "clients/*/title") { AnyView($0.font(.title)) }

        // Style for any body text
        stylist.addStyle(identifier: "*/*/body") { AnyView($0.font(.body)) }

        // Style for the tags inside a clientlistitem in the clients section
        stylist.addStyle(identifier: "clients/clientlistitem/tag") {
            AnyView($0.font(.title).background(LinearGradient(gradient: Gradient(colors: [.red, .blue]), startPoint: .top, endPoint: .bottom)))
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(10)) {
            stylist.addStyle(identifier: "clients/clientlistitem/tag", style: {
                AnyView($0.font(.title).background(Color.blue))
            })
        }

        return stylist
    }
}