import Foundation
import SwiftUI
import StylableSwiftUI

/*
 * THIS IS AN AUTO-GENERATED FILE. DO NOT EDIT IT.
 * IF YOU EDIT THIS FILE, THE MOST LIKELY SCENARIO IS THAT
 * YOUR CHANGES WILL BE OVERRIDDEN NEXT TIME THE FILE IS GENERATED.
 */

// swiftlint:disable all
extension Stylist {
    static func create() -> Stylist {

        let stylist = Stylist()

{{#if styles}}
{{#each styles}}
        stylist.addStyle(identifier: "{{name}}") {
            $0{{#if text}}
                .styleText { text in
                    text{{#each text}}
                        .{{name}}({{{value}}}){{/each}}
                }{{/if}}
                {{#each style}}
                .{{name}}({{{value}}})
                {{/each}}
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
extension TextCase {
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

extension View {
    // Is there a better name for this?
    @ViewBuilder
    func withTextCase(_ casing: TextCase) -> some View {
        if #available(iOS 14, *) {
            self.textCase(casing.toSwiftUICase)
        } else {
            self
        }
    }
}

// Adds support for rounding a specific corner

struct RoundedCorners: Shape {
    var tl: CGFloat = 0.0
    var tr: CGFloat = 0.0
    var bl: CGFloat = 0.0
    var br: CGFloat = 0.0

    func path(in rect: CGRect) -> Path {
        var path = Path()

        let w = rect.size.width
        let h = rect.size.height

        // Make sure we do not exceed the size of the rectangle
        let tr = min(min(self.tr, h/2), w/2)
        let tl = min(min(self.tl, h/2), w/2)
        let bl = min(min(self.bl, h/2), w/2)
        let br = min(min(self.br, h/2), w/2)

        path.move(to: CGPoint(x: w / 2.0, y: 0))
        path.addLine(to: CGPoint(x: w - tr, y: 0))
        path.addArc(center: CGPoint(x: w - tr, y: tr), radius: tr,
                    startAngle: Angle(degrees: -90), endAngle: Angle(degrees: 0), clockwise: false)

        path.addLine(to: CGPoint(x: w, y: h - br))
        path.addArc(center: CGPoint(x: w - br, y: h - br), radius: br,
                    startAngle: Angle(degrees: 0), endAngle: Angle(degrees: 90), clockwise: false)

        path.addLine(to: CGPoint(x: bl, y: h))
        path.addArc(center: CGPoint(x: bl, y: h - bl), radius: bl,
                    startAngle: Angle(degrees: 90), endAngle: Angle(degrees: 180), clockwise: false)

        path.addLine(to: CGPoint(x: 0, y: tl))
        path.addArc(center: CGPoint(x: tl, y: tl), radius: tl,
                    startAngle: Angle(degrees: 180), endAngle: Angle(degrees: 270), clockwise: false)
        path.closeSubpath()

        return path
    }
}

{{#if theming}}
// Add support for themes
extension Theme {
    {{#each theming.themes}}
    static let {{{ name }}} = Theme(name: "{{{ name }}}")
    {{/each}}
}
{{/if}}

// swiftlint:enable all