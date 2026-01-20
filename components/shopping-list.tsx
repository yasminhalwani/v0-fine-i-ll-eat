"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Rocket, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

export interface ShoppingItem {
  item: string;
  quantity: string;
  category: string;
}

interface ShoppingListProps {
  items: ShoppingItem[];
}

export function ShoppingList({ items }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Array.from(new Set(items.map((i) => i.category))))
  );
  const [copied, setCopied] = useState(false);

  // Group items by category
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ShoppingItem[]>
  );

  const categories = Object.keys(groupedItems).sort();

  const toggleItem = (itemKey: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const copyToClipboard = async () => {
    const listText = categories
      .map((category) => {
        const categoryItems = groupedItems[category]
          .map((item) => `  - ${item.item} (${item.quantity})`)
          .join("\n");
        return `${category}:\n${categoryItems}`;
      })
      .join("\n\n");

    await navigator.clipboard.writeText(listText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalItems = items.length;
  const checkedCount = checkedItems.size;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Rocket className="h-5 w-5 text-primary" />
            Mission: Shopping List
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="gap-2 bg-transparent"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy List
              </>
            )}
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {checkedCount} of {totalItems} items
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.map((category) => {
          const categoryItems = groupedItems[category];
          const isExpanded = expandedCategories.has(category);
          const categoryCheckedCount = categoryItems.filter((item) =>
            checkedItems.has(`${category}-${item.item}`)
          ).length;

          return (
            <div key={category} className="border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{category}</span>
                  <span className="text-xs text-muted-foreground">
                    ({categoryCheckedCount}/{categoryItems.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {isExpanded && (
                <div className="divide-y">
                  {categoryItems.map((item) => {
                    const itemKey = `${category}-${item.item}`;
                    const isChecked = checkedItems.has(itemKey);

                    return (
                      <label
                        key={itemKey}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors ${
                          isChecked ? "bg-muted/20" : ""
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleItem(itemKey)}
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span
                            className={`text-sm ${
                              isChecked ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {item.item}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.quantity}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
