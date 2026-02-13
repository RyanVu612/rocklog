//
//  Item.swift
//  Rocklog
//
//  Created by Ryan Vu on 2/12/26.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
