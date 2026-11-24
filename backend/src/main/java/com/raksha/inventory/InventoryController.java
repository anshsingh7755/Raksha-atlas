package com.raksha.inventory;

import java.util.List;

import com.raksha.common.PageResponse;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<InventoryItem> list() {
        return inventoryService.list();
    }

    @GetMapping("/v2")
    public PageResponse<InventoryItem> search(
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, name = "q") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(defaultValue = "service") String sort,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction) {
        return PageResponse.from(inventoryService.search(service, category, query, page, size, sort, direction));
    }
}
