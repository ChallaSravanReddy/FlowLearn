export function isValidConnectionRule(sourceType: string, targetType: string): boolean {
    // Basic sanity: no connection to self
    if (sourceType === targetType) return false;

    const source = sourceType.replace('_', '').toLowerCase();
    const target = targetType.replace('_', '').toLowerCase();

    // Define rules for outgoing connections from each node type:
    switch (source) {
        case 'dns':
            // DNS translates name to IP, points to client
            // or routes to CDN, WAF, Firewall, Load Balancer, API Gateway
            return ['cdn', 'waf', 'firewall', 'loadbalancer', 'api', 'client'].includes(target);

        case 'client':
            // Client connects to DNS, CDN, WAF, Firewall, Load Balancer, API Gateway, Auth Service, or Object Storage
            return ['dns', 'cdn', 'waf', 'firewall', 'loadbalancer', 'api', 'auth', 'storage'].includes(target);

        case 'cdn':
            // CDN points to WAF, Firewall, Load Balancer, API Gateway, or Object Storage (S3 origin)
            return ['waf', 'firewall', 'loadbalancer', 'api', 'storage'].includes(target);

        case 'waf':
            // WAF filters and forwards to Load Balancer, API Gateway, or Backend Service/Server
            return ['loadbalancer', 'api', 'service', 'server', 'serverless'].includes(target);

        case 'firewall':
            // Network Firewall filters traffic and forwards it to gateway, balancer, or service
            return ['loadbalancer', 'api', 'service', 'server', 'serverless', 'waf'].includes(target);

        case 'loadbalancer':
            // Load Balancer distributes to API Gateway, Backend Service, Server, or Serverless Function
            return ['api', 'service', 'server', 'serverless'].includes(target);

        case 'api':
            // API Gateway routes to Backend Service, Server, Serverless Fn, Auth Provider, Cache, Object Storage, Message Queue, or Message Broker
            return ['service', 'server', 'serverless', 'auth', 'cache', 'storage', 'queue', 'broker'].includes(target);

        case 'auth':
            // Auth Provider validates and can query Database or Cache
            return ['database', 'cache'].includes(target);

        case 'service':
            // Backend Service connects to: other Services, Servers, Database, Cache, Queue, Broker, Search Engine, Notification Hub, Object Storage
            return ['service', 'server', 'serverless', 'database', 'cache', 'queue', 'broker', 'search', 'storage', 'notification'].includes(target);

        case 'server':
            // VM Server connects to: other Services, Servers, Database, Cache, Queue, Broker, Search Engine, Notification Hub, Object Storage
            return ['service', 'server', 'serverless', 'database', 'cache', 'queue', 'broker', 'search', 'storage', 'notification'].includes(target);

        case 'serverless':
            // Serverless connects to: Database, Cache, Queue, Broker, Search Engine, Notification Hub, Object Storage
            return ['database', 'cache', 'queue', 'broker', 'search', 'storage', 'notification'].includes(target);

        case 'worker':
            // Workers process background jobs: connect to Service, Server, Database, Cache, Queue, Broker, Search, Notification, Storage
            return ['service', 'server', 'serverless', 'database', 'cache', 'queue', 'broker', 'search', 'storage', 'notification'].includes(target);

        case 'queue':
            // Message Queues deliver messages to: Worker, Backend Service, Server, Notification Service
            return ['worker', 'service', 'server', 'serverless', 'notification'].includes(target);

        case 'broker':
            // Message Brokers deliver messages to: Worker, Backend Service, Server, Notification Service
            return ['worker', 'service', 'server', 'serverless', 'notification'].includes(target);

        case 'cache':
            // Cache is passive, it does not typically initiate connections
            return false;

        case 'database':
            // Database is passive, but can connect to cache sync or replication database
            return ['database', 'cache'].includes(target);

        case 'storage':
            // Object storage is passive
            return false;

        case 'search':
            // Search engine is passive
            return false;

        case 'notification':
            // Notification service is passive (sends out to external world)
            return false;

        default:
            return true;
    }
}
