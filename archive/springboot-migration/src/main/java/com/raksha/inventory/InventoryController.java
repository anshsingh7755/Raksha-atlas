package com.raksha.inventory;

import java.util.List;

import com.raksha.common.PageResponse;
import com.raksha.domain.DomainReadService;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final DomainReadService domainReadService;

    public InventoryController(InventoryService inventoryService, DomainReadService domainReadService) {
        this.inventoryService = inventoryService;
        this.domainReadService = domainReadService;
    }

    @GetMapping
    public java.util.Map<String, Object> list(
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String quantityStatus,
            @RequestParam(required = false) String originCountry) {
        return domainReadService.inventory(service, category, quantityStatus, originCountry);
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
