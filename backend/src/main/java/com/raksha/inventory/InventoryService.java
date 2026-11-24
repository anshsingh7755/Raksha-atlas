package com.raksha.inventory;

import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class InventoryService {

    private static final Set<String> SORT_FIELDS = Set.of("service", "category", "platform", "quantity", "id");
    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<InventoryItem> list() {
        return inventoryRepository.findAll(Sort.by("service").ascending().and(Sort.by("category")).and(Sort.by("platform")));
    }

    public Page<InventoryItem> search(String service, String category, String query,
                                      int page, int size, String sortField, Sort.Direction direction) {
        if (!SORT_FIELDS.contains(sortField)) {
            throw new IllegalArgumentException("Unsupported sort field");
        }
        if (page < 0 || size < 1 || size > 100) {
            throw new IllegalArgumentException("page must be >= 0 and size must be between 1 and 100");
        }
        Specification<InventoryItem> spec = (root, criteria, builder) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (service != null && !service.isBlank()) {
                predicates.add(builder.equal(builder.lower(root.get("service")), service.trim().toLowerCase()));
            }
            if (category != null && !category.isBlank()) {
                predicates.add(builder.equal(builder.lower(root.get("category")), category.trim().toLowerCase()));
            }
            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("platform")), pattern),
                        builder.like(builder.lower(root.get("role")), pattern),
                        builder.like(builder.lower(root.get("definition")), pattern)));
            }
            return builder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
        return inventoryRepository.findAll(spec, PageRequest.of(page, size, Sort.by(direction, sortField)));
    }
}
