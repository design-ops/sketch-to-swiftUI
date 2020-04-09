import Foundation
import SwiftUI
import StylableSwiftUI

/*
 * THIS IS AN AUTO-GENERATED FILE. DO NOT EDIT IT.
 * IF YOU EDIT THIS FILE, THE MOST LIKELY SCENARIO IS THAT
 * YOUR CHANGES WILL BE OVERRIDDEN NEXT TIME THE FILE IS GENERATED.
 */

//swiftlint:disable all
extension Stylist {
    static func create() -> Stylist {

        let stylist = Stylist()

{{#if styles}}
{{#each styles}}
        stylist.addStyle(identifier: "{{name}}") {
            AnyView($0{{#if text}}
                      .styleText { text in
                          text{{#each text}}
                              .{{name}}({{{value}}}){{/each}}
                      }{{/if}}
                      {{#each style}}
                        .{{name}}({{{value}}})
                      {{/each}}
            )
        }
{{/each}}
{{/if}}

        return stylist
    }
}
//swiftlint:enable all