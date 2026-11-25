package com.raksha.domain;

import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
@RequestMapping("/api")
public class DomainReadController {
    private final DomainReadService domainReadService;
    public DomainReadController(DomainReadService service) { this.domainReadService = service; }

    @GetMapping("/sources")
    public Map<String, Object> sources() { return domainReadService.sources(); }

    @GetMapping("/programmes")
    public Map<String, Object> programmes(
            @RequestParam(required = false) String service,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String stageClassification,
            @RequestParam(required = false) String evidenceQuality,
            @RequestParam(required = false, name = "q") String query) {
        return domainReadService.programmes(service, status, stageClassification, evidenceQuality, query);
    }

    @GetMapping("/procurement-2026")
    public Map<String, Object> procurement(@RequestParam(required = false) String scope,
                                           @RequestParam(required = false) String status) {
        return domainReadService.procurement(scope, status);
    }
}
