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

extension UIKitStyleContainer {
    static func create(with stylist: Stylist) -> UIKitStyleContainer {
        let container = UIKitStyleContainer(stylist: stylist)
        {{#if uiKitProps}}
            {{#each uiKitProps}}
                {{#if properties.length}}
                container.addProperty(identifier: "{{name}}") {
                    return [
                        {{#each properties}}
                            .{{name}}({{{value}}}){{#if @last}}{{else}},{{/if}}
                        {{/each}}
                    ]
                }
                {{/if}}
            {{/each}}
        {{/if}}

        return container
    }
}

/// Casing support to enable casing in iOS 14 only.
extension Text {
    enum Casing {
        case uppercase
        case lowercase
        case none

        @available(iOS 14, *)
        var toSwiftUICase: Text.Case? {
            switch self {
            case .uppercase:
                return .uppercase
            case .lowercase:
                return .lowercase
            case .none:
                return nil
            }
        }
    }
}

extension View {

    // Is there a better name for this?
    @ViewBuilder
    func withTextCase(_ casing: Text.Casing) -> some View {
        if #available(iOS 14, *) {
            self.textCase(casing?.toSwiftUICase)
        } else {
            self
        }
    }
}


//swiftlint:enable all